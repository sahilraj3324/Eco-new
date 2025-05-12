namespace Ecocys.Admin.Core
{
    public class Common
    {
        public static string GenerateOTP()
        {
            Random random = new Random();
            int otp = random.Next(100000, 999999); // Generates a number between 100000 and 999999
            return otp.ToString();
        }
    }
}