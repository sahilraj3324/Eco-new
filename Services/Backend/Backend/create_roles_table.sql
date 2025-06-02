CREATE TABLE [Admins] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Phone] nvarchar(max) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Admins] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [AskAdmins] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] nvarchar(max) NOT NULL,
    [UserName] nvarchar(max) NOT NULL,
    [Question] nvarchar(max) NOT NULL,
    [Answer] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_AskAdmins] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Buyers] (
    [Id] uniqueidentifier NOT NULL,
    [storename] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [PhoneNumber] bigint NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [GstNumber] nvarchar(max) NOT NULL,
    [UserType] nvarchar(max) NOT NULL,
    [pincode] bigint NOT NULL,
    [hnscode] nvarchar(max) NOT NULL,
    [profile_picture] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Buyers] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Categories] (
    [Id] uniqueidentifier NOT NULL,
    [CategoryName] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [ImageStores] (
    [Id] uniqueidentifier NOT NULL,
    [Image1] nvarchar(max) NOT NULL,
    [Image2] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
    [UpdatedAt] datetime2 NULL,
    CONSTRAINT [PK_ImageStores] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Products] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Description] nvarchar(max) NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Stock] int NOT NULL,
    [SellerId] nvarchar(max) NOT NULL,
    [Category] nvarchar(max) NOT NULL,
    [Brand] nvarchar(max) NOT NULL,
    [Material] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [ImageUrlsJson] nvarchar(max) NOT NULL,
    [VariantsJson] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [Subcategory] nvarchar(max) NOT NULL,
    [Gst] nvarchar(max) NOT NULL,
    [Hsn1] nvarchar(max) NOT NULL,
    [MOQ] nvarchar(max) NOT NULL,
    [PiecesPerPack] nvarchar(max) NOT NULL,
    [FitShape] nvarchar(max) NOT NULL,
    [NeckType] nvarchar(max) NOT NULL,
    [Occasion] nvarchar(max) NOT NULL,
    [Pattern] nvarchar(max) NOT NULL,
    [SleeveLength] nvarchar(max) NOT NULL,
    [ShipsIn] nvarchar(max) NOT NULL,
    [MainImage] nvarchar(max) NOT NULL,
    [Top] nvarchar(max) NOT NULL,
    [Trending] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [ReviewRatings] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] nvarchar(max) NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [Rating] int NOT NULL,
    [Review] nvarchar(max) NOT NULL,
    [Images] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_ReviewRatings] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Roles] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [Name] nvarchar(100) NOT NULL,
    [TabsString] nvarchar(max) NULL,
    [CreatedAt] datetime2(7) NOT NULL,
    [UpdatedAt] datetime2(7) NOT NULL
);
GO


CREATE TABLE [Sellers] (
    [Id] uniqueidentifier NOT NULL,
    [storename] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [PasswordHash] nvarchar(max) NOT NULL,
    [PhoneNumber] bigint NOT NULL,
    [Address] nvarchar(max) NOT NULL,
    [GstNumber] nvarchar(max) NOT NULL,
    [UserType] nvarchar(max) NOT NULL,
    [pincode] bigint NOT NULL,
    [hnscode] nvarchar(max) NOT NULL,
    [profile_picture] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_Sellers] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [SubAdmins] (
    [Id] uniqueidentifier NOT NULL,
    [Name] nvarchar(max) NOT NULL,
    [Email] nvarchar(max) NOT NULL,
    [Phone] nvarchar(max) NOT NULL,
    [Password] nvarchar(max) NOT NULL,
    [Role] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_SubAdmins] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [SubCategories] (
    [Id] uniqueidentifier NOT NULL,
    [SubCategoryName] nvarchar(max) NOT NULL,
    [CategoryId] uniqueidentifier NOT NULL,
    CONSTRAINT [PK_SubCategories] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [CartItems] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] nvarchar(max) NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [VariantId] uniqueidentifier NOT NULL,
    [Quantity] int NOT NULL,
    [AddedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_CartItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CartItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [Orders] (
    [Id] uniqueidentifier NOT NULL,
    [BuyerId] nvarchar(max) NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [VariantId] uniqueidentifier NOT NULL,
    [Quantity] int NOT NULL,
    [UnitPrice] decimal(18,2) NOT NULL,
    [SellerId] nvarchar(max) NOT NULL,
    [Status] nvarchar(max) NOT NULL,
    [OrderDate] datetime2 NOT NULL,
    [ProcessedAt] datetime2 NULL,
    [ShippingAddress] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Orders_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [WishlistItems] (
    [Id] uniqueidentifier NOT NULL,
    [UserId] nvarchar(max) NOT NULL,
    [ProductId] uniqueidentifier NOT NULL,
    [AddedAt] datetime2 NOT NULL,
    CONSTRAINT [PK_WishlistItems] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_WishlistItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_CartItems_ProductId] ON [CartItems] ([ProductId]);
GO


CREATE INDEX [IX_Orders_ProductId] ON [Orders] ([ProductId]);
GO


CREATE INDEX [IX_WishlistItems_ProductId] ON [WishlistItems] ([ProductId]);
GO


-- Create index on Name for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Roles_Name' AND object_id = OBJECT_ID('Roles'))
BEGIN
    CREATE INDEX IX_Roles_Name ON [dbo].[Roles] ([Name]);
    PRINT 'Index on Roles.Name created successfully'
END


