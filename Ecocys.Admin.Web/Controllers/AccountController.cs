using Dapper;
using Ecocys.Admin.Core;
using Ecocys.Admin.Core.Account;
using Ecocys.Admin.Core.Master;
using Ecocys.Admin.DAL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Data;

namespace Ecocys.Admin.Web.Controllers;

public class AccountController : Controller
{
    private readonly IDapperService _dapper;
    private readonly EFDatabaseContext _dbContext;
    public readonly IEmailService _emailService;
    public AccountController(IDapperService dapper, EFDatabaseContext dbContext, IEmailService emailService)
    {
        _dapper = dapper;
        _dbContext = dbContext;
        _emailService = emailService;
    }

    public IActionResult Login() => View();

    [HttpPost]
    public async Task<IActionResult> LoginAsync(LoginRequest model)
    {
        try
        {
            if (ModelState.IsValid)
            {
                var parameters = new DynamicParameters(model);
                parameters.Add("@Message", null, null, ParameterDirection.Output, 100);
                var user = await _dapper.Execute<User>("sp_Login", parameters);
                string message = parameters.Get<string>("@Message");
                if (user != null)
                {
                    HttpContext.Session.SetString("UserId", user.UserId.ToString());
                    HttpContext.Session.SetString("User", JsonConvert.SerializeObject(user));
                    if (user.BankVerified) return RedirectToAction("ProductVariant", "Master");
                    else return RedirectToAction(nameof(SellerVerification));
                }
                else { ModelState.AddModelError("", message); return View(model); }
            }
        }
        catch (Exception ex)
        {
            ModelState.AddModelError("", ex?.Message ?? ex?.InnerException?.Message ?? "Something went wrong! try again after sometime.");
        }
        return View(model);
    }
    public IActionResult SellerVerification()
    {
        long userId = Convert.ToInt64(HttpContext.Session.GetString("UserId"));
        var user = _dbContext.Users.FirstOrDefault(x => x.UserId == userId);
        return View(user);
    }
    public IActionResult TaxDetails() => PartialView();

    [HttpPost]
    public async Task<GstDetails?> VerifyTaxDetailsAsync(string gstin)
    {
        string url = $"https://developer.gst.gov.in/commonapi/v1.0/unregistered-applicants?action=TP&uid=27AAEPM1234C1Z2";
        using (HttpClient client = new HttpClient())
        {
            //client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_API_KEY");
            HttpResponseMessage response = await client.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                string jsonResponse = await response.Content.ReadAsStringAsync();
                return JsonConvert.DeserializeObject<GstDetails>(jsonResponse);
            }
            else
            {
                throw new Exception("Error verifying GST number");
            }
        }
    }
    public IActionResult StoreAndPickupDetails() => PartialView();

    [HttpPost]
    public async Task<IActionResult> StoreAndPickupDetails(StoreAndPickupDetails model)
    {
        long userId = Convert.ToInt64(HttpContext.Session.GetString("UserName"));
        try
        {
            if (model.StoreId > 0)
            {
                _dbContext.StoreAndPickupDetails.Update(model);
            }
            else
            {
                _dbContext.StoreAndPickupDetails.Add(model);
            }
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(SellerVerification));
    }
    public IActionResult BankDetails() => PartialView();

    [HttpPost]
    public async Task<IActionResult> BankDetails(BankDetails model)
    {
        long userId = Convert.ToInt64(HttpContext.Session.GetString("UserName"));
        try
        {
            if (model.BankId > 0)
            {
                _dbContext.BankDetails.Update(model);
            }
            else
            {
                _dbContext.BankDetails.Add(model);
            }
            await _dbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            ex.ToString();
        }
        return RedirectToAction(nameof(SellerVerification));
    }
    public IActionResult Register() => View();

    [HttpPost]
    public async Task<IActionResult> RegisterAsync(User model)
    {
        try
        {
            ModelState.Remove("Password");
            if (ModelState.IsValid)
            {
                var user = _dbContext.Users.FirstOrDefault(x => x.Mobile == model.Mobile || x.Email == model.Email);
                if (user == null)
                {
                    model.Password = Array.Empty<byte>();
                    _dbContext.Users.Add(model);
                    await _dbContext.SaveChangesAsync();
                    if (model.UserId > 0)
                    {
                        string password = Request.Form["Password"].ToString() ?? string.Empty;
                        await _dbContext.Database.ExecuteSqlRawAsync("exec sp_update_user_password @userId, @password",
                            new SqlParameter("@userId", model.UserId), new SqlParameter("@password", password));
                    }
                    return RedirectToAction(nameof(Login));
                }
                else ModelState.AddModelError("", "Already registered.");
            }
            else
            {
                if (!model.IsEmailVerified) ModelState.AddModelError("Email", "Please verify your email.");
                if (!model.IsMobileVerified) ModelState.AddModelError("Mobile", "Please verify your mobile number.");
            }
        }
        catch (Exception ex)
        {
            ModelState.AddModelError("", ex?.Message ?? ex?.InnerException?.Message ?? "Something went wrong! try again after sometime.");
        }
        return View(model);
    }
    public async Task<JsonResult> SendOtpOnMobileAsync(string mobile)
    {
        OTPHistory otpHistory = new OTPHistory
        {
            OTP = Common.GenerateOTP(),
            OTPOn = "Mobile",
            OTPContact = $"+91 {mobile}",
            OTPSentOn = DateTime.UtcNow,
            OTPExpiryMinute = 3
        };
        await _dbContext.OTPHistory.AddAsync(otpHistory);
        await _dbContext.SaveChangesAsync();
        return Json(otpHistory);
    }
    public async Task<JsonResult> SendOtpOnEmailAsync(string email)
    {
        OTPHistory otpHistory = new OTPHistory
        {
            OTP = Common.GenerateOTP(),
            OTPOn = "Email",
            OTPContact = email,
            OTPSentOn = DateTime.UtcNow,
            OTPExpiryMinute = 3
        };
        await _dbContext.OTPHistory.AddAsync(otpHistory);
        await _dbContext.SaveChangesAsync();
        await SendOTPOnEmail(email, otpHistory.OTP);
        return Json(otpHistory);
    }
    private async Task<IActionResult> SendOTPOnEmail(string email, string otp)
    {
        string body = @$"
<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"">
    <title>OTP Verification</title>
    <style>
        /* Ensure styles are inline for better email client compatibility */
        body {{
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
        }}
        table {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-spacing: 0;
            width: 100%;
        }}
        td {{
            padding: 20px;
            text-align: center;
        }}
        h1 {{
            color: #333333;
            font-size: 24px;
            margin-bottom: 20px;
        }}
        p {{
            color: #666666;
            font-size: 16px;
            line-height: 1.6;
        }}
        .otp-code {{
            display: inline-block;
            padding: 10px 20px;
            background-color: #007bff;
            color: #ffffff;
            font-size: 24px;
            letter-spacing: 4px;
            margin-top: 20px;
            text-decoration: none;
        }}
        .footer {{
            background-color: #f2f2f2;
            color: #999999;
            font-size: 12px;
            padding: 10px;
        }}
        @media screen and (max-width: 600px) {{
            h1 {{
                font-size: 20px;
            }}
            p {{
                font-size: 14px;
            }}
        }}
    </style>
</head>
<body>
    <table>
        <tr>
            <td>
                <h1>OTP Verification</h1>
                <p>Dear user,</p>
                <p>Thank you for registering with us. To complete your registration, please use the following OTP code:</p>
                <p class=""otp-code"">{otp}</p>
                <p>This OTP is valid for 3 minutes. If you did not request this, please ignore this email.</p>
                <p>Best regards,<br>Ecocys team</p>
            </td>
        </tr>
        <tr>
            <td class=""footer"">
                © 2024 Your Company. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
";
        await _emailService.SendEmailAsync(email, "OTP for registration", body);
        return Ok("Email sent successfully.");
    }
    public async Task<JsonResult> VerifyOTPAsync(string contact, string otp)
    {
        var obj = await _dbContext.OTPHistory.OrderByDescending(x => x.OTPId).FirstOrDefaultAsync(x => x.OTPContact == contact);
        if (obj?.OTP != otp) return Json(new { Verified = false, Message = "Incorrect otp." });
        if (DateTime.UtcNow > obj?.OTPSentOn.AddMinutes(obj?.OTPExpiryMinute ?? 0)) return Json(new { Verified = false, Message = "OTP is expired." });
        return Json(new { Verified = true, Message = "Success." });
    }
}