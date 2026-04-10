
CREATE schema jewelry;
USE jewelry;

-- TABLE: Account
CREATE TABLE Account (
    AccountID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(100),
    PhoneNumber VARCHAR(15),
    FullName VARCHAR(100),
    Address TEXT,
    Role ENUM('Customer', 'ADMIN') NOT NULL,
    Status ENUM('ACTIVE', 'LOCKED') NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: Category
CREATE TABLE Category (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    Description TEXT,
    Status VARCHAR(20)
);

-- TABLE: Product
CREATE TABLE Product (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(150) NOT NULL,
    CategoryID INT NOT NULL,
    Description TEXT,
    Price DECIMAL(15,2) NOT NULL,
    ImageURL VARCHAR(255) NOT NULL,
    Status VARCHAR(20),
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);

-- TABLE: Cart
CREATE TABLE Cart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- TABLE: CartItem
CREATE TABLE CartItem (
    CartItemID INT AUTO_INCREMENT PRIMARY KEY,
    CartID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    Price DECIMAL(15,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(15,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (CartID) REFERENCES Cart(CartID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);



-- TABLE: Material
CREATE TABLE Material (
    MaterialID INT AUTO_INCREMENT PRIMARY KEY,
    MaterialName VARCHAR(100) NOT NULL,
    Composition VARCHAR(100) NOT NULL,
    Weight VARCHAR(50) NOT NULL,
    Purity VARCHAR(100) NOT NULL,
    Unit VARCHAR(20)
);

-- TABLE: MaterialPrice
CREATE TABLE MaterialPrice (
    MaterialPriceID INT AUTO_INCREMENT PRIMARY KEY,
    MaterialID INT NOT NULL,
    Price DECIMAL(15,2) NOT NULL,
    EffectiveDate DATE NOT NULL,
    FOREIGN KEY (MaterialID) REFERENCES Material(MaterialID)
);

-- TABLE: ProductDetail
CREATE TABLE ProductDetail (
    ProductDetailID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    MaterialID INT NOT NULL,
    ReferenceWeight DECIMAL(10,2) NOT NULL,
    Composition VARCHAR(50) NOT NULL,
    DetailDescription TEXT,
    StockQuantity INT NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (MaterialID) REFERENCES Material(MaterialID)
);

-- TABLE: Order
CREATE TABLE `Order` (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(15,2) NOT NULL,
    OrderStatus ENUM('Completed', 'Pending Payment') NOT NULL,
    ShippingAddress TEXT NOT NULL,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- TABLE: OrderDetail
CREATE TABLE OrderDetail (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(15,2) NOT NULL,
    TotalAmount DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- TABLE: Payment
CREATE TABLE Payment (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    PaymentStatus ENUM('Success', 'Failed') NOT NULL,
    PaymentDate DATETIME NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    FOREIGN KEY (OrderID) REFERENCES `Order`(OrderID)
);

-- TABLE: RewardPoint
CREATE TABLE RewardPoint (
    RewardPointID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    Points INT NOT NULL,
    UpdatedAt DATETIME,
    Note TEXT,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- TABLE: PasswordReset
CREATE TABLE PasswordReset (
    PasswordResetID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT,
    VerificationCode VARCHAR(100),
    ExpirationTime DATETIME,
    Status VARCHAR(20),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- TABLE: Review
CREATE TABLE Review (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    AccountID INT NOT NULL,
    ProductID INT NOT NULL,
    Rating INT CHECK (Rating BETWEEN 1 AND 5) NOT NULL,
    Comment TEXT,
    ReviewDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- Account
INSERT INTO Account (Username, Password, Email, PhoneNumber, FullName, Address, Role, Status)
VALUES
('user1','123456','user1@gmail.com','0900000001','Nguyen Van A','Ha Noi','Customer','ACTIVE'),
('user2','123456','user2@gmail.com','0900000002','Tran Thi B','Hai Phong','Customer','ACTIVE'),
('user3','123456','user3@gmail.com','0900000003','Le Van C','Da Nang','Customer','ACTIVE'),
('user4','123456','user4@gmail.com','0900000004','Pham Thi D','HCM','Customer','ACTIVE'),
('user5','123456','user5@gmail.com','0900000005','Hoang Van E','Hue','Customer','ACTIVE'),
('admin1','admin123','admin1@gmail.com','0900000006','Admin One','Ha Noi','ADMIN','ACTIVE'),
('user6','123456','user6@gmail.com','0900000007','Vo Thi F','Can Tho','Customer','ACTIVE'),
('user7','123456','user7@gmail.com','0900000008','Do Van G','Quang Ninh','Customer','ACTIVE'),
('user8','123456','user8@gmail.com','0900000009','Bui Thi H','Nam Dinh','Customer','ACTIVE'),
('user9','123456','user9@gmail.com','0900000010','Dang Van I','Thanh Hoa','Customer','ACTIVE');

-- Category
INSERT INTO Category (CategoryName, Description, Status)
VALUES
('Ring','Gold ring','ACTIVE'),
('Necklace','Gold necklace','ACTIVE'),
('Bracelet','Silver bracelet','ACTIVE'),
('Earrings','Women earrings','ACTIVE'),
('Bangle','Gold bangle','ACTIVE'),
('Anklet','Women anklet','ACTIVE'),
('Pendant','Feng shui pendant','ACTIVE'),
('Wedding Jewelry','Wedding jewelry set','ACTIVE'),
('Charm','Silver charm','ACTIVE'),
('Other','Other jewelry','ACTIVE');

-- Product
INSERT INTO Product (ProductName, CategoryID, Description, Price, ImageURL, Status)
VALUES
('18K Gold Ring',1,'High quality gold ring',5000000,'nhan1.jpg','Available'),
('24K Gold Necklace',2,'Beautiful necklace',8000000,'day1.jpg','Available'),
('Silver Bracelet',3,'925 silver bracelet',1200000,'vong1.jpg','Available'),
('Gold Earrings',4,'Women earrings',2000000,'bong1.jpg','Available'),
('Gold Bangle',5,'Beautiful bangle',3500000,'lac1.jpg','Available'),
('Silver Anklet',6,'Women anklet',900000,'lacchan1.jpg','Available'),
('Buddha Pendant',7,'Feng shui',1500000,'mat1.jpg','Available'),
('Wedding Jewelry Set',8,'Premium wedding set',15000000,'cuoi1.jpg','Available'),
('Heart Charm',9,'Silver charm',600000,'charm1.jpg','Available'),
('Silver Ring',1,'Beautiful silver ring',1000000,'nhan2.jpg','Available');

-- Material
INSERT INTO Material (MaterialName, Composition, Weight, Purity, Unit)
VALUES
('24K Gold','Au','1 chi','99.99%','chi'),
('18K Gold','Au','1 chi','75%','chi'),
('Silver 925','Ag','1 chi','92.5%','chi'),
('Pure Silver','Ag','1 chi','99.9%','chi'),
('White Gold','Au','1 chi','75%','chi'),
('CZ Stone','CZ','1 piece','High','piece'),
('Diamond','C','1 piece','VVS1','piece'),
('Pearl','Pearl','1 piece','Natural','piece'),
('Ruby','Ruby','1 piece','Natural','piece'),
('Sapphire','Sapphire','1 piece','Natural','piece');

-- MaterialPrice
INSERT INTO MaterialPrice (MaterialID, Price, EffectiveDate)
VALUES
(1,7000000,'2024-01-01'),
(2,5500000,'2024-01-01'),
(3,800000,'2024-01-01'),
(4,900000,'2024-01-01'),
(5,6000000,'2024-01-01'),
(6,200000,'2024-01-01'),
(7,15000000,'2024-01-01'),
(8,500000,'2024-01-01'),
(9,3000000,'2024-01-01'),
(10,3500000,'2024-01-01');

-- ProductDetail
INSERT INTO ProductDetail (ProductID, MaterialID, ReferenceWeight, Composition, DetailDescription, StockQuantity)
VALUES
(1,2,1.2,'18K Gold','18K gold ring 1.2 chi',50),
(2,1,2.0,'24K Gold','Necklace 2 chi',40),
(3,3,1.5,'Silver 925','Silver bracelet',100),
(4,2,0.8,'18K Gold','Gold earrings',60),
(5,2,1.0,'18K Gold','Gold bangle',70),
(6,3,0.5,'Silver 925','Anklet',80),
(7,1,0.7,'24K Gold','Buddha pendant',30),
(8,1,3.0,'24K Gold','Wedding set',20),
(9,3,0.3,'Silver 925','Charm',150),
(10,4,1.1,'Pure Silver','Silver ring',90);

-- Cart
INSERT INTO Cart (AccountID, Status)
VALUES
(1,'OPEN'),
(2,'OPEN'),
(3,'OPEN'),
(4,'OPEN'),
(5,'OPEN'),
(6,'OPEN'),
(7,'OPEN'),
(8,'OPEN'),
(9,'OPEN'),
(10,'OPEN');

-- CartItem
INSERT INTO CartItem (CartID, ProductID, Quantity, Price, TotalAmount)
VALUES
(1,1,1,5000000,5000000),
(2,2,1,8000000,8000000),
(3,3,2,1200000,2400000),
(4,4,1,2000000,2000000),
(5,5,1,3500000,3500000),
(6,6,2,900000,1800000),
(7,7,1,1500000,1500000),
(8,8,1,15000000,15000000),
(9,9,3,600000,1800000),
(10,10,1,1000000,1000000);

-- Orders
INSERT INTO `Order` (AccountID, TotalAmount, OrderStatus, ShippingAddress)
VALUES
(1,5000000,'Completed','Ha Noi'),
(2,8000000,'Completed','Hai Phong'),
(3,2400000,'Pending Payment','Da Nang'),
(4,2000000,'Completed','HCM'),
(5,3500000,'Completed','Hue'),
(6,1800000,'Pending Payment','Can Tho'),
(7,1500000,'Completed','Quang Ninh'),
(8,15000000,'Completed','Nam Dinh'),
(9,1800000,'Pending Payment','Thanh Hoa'),
(10,1000000,'Completed','Ha Noi');

-- OrderDetail
INSERT INTO OrderDetail (OrderID, ProductID, Quantity, Price, TotalAmount)
VALUES
(1,1,1,5000000,5000000),
(2,2,1,8000000,8000000),
(3,3,2,1200000,2400000),
(4,4,1,2000000,2000000),
(5,5,1,3500000,3500000),
(6,6,2,900000,1800000),
(7,7,1,1500000,1500000),
(8,8,1,15000000,15000000),
(9,9,3,600000,1800000),
(10,10,1,1000000,1000000);

-- PasswordReset
INSERT INTO PasswordReset (AccountID, VerificationCode, ExpirationTime, Status)
VALUES
(1,'ABC123',NOW(),'Unused'),
(2,'DEF456',NOW(),'Unused'),
(3,'GHI789',NOW(),'Used'),
(4,'JKL012',NOW(),'Unused'),
(5,'MNO345',NOW(),'Used'),
(6,'PQR678',NOW(),'Unused'),
(7,'STU901',NOW(),'Unused'),
(8,'VWX234',NOW(),'Used'),
(9,'YZA567',NOW(),'Unused'),
(10,'BCD890',NOW(),'Unused');

-- Review
INSERT INTO Review (AccountID, ProductID, Rating, Comment)
VALUES
(1,1,5,'Very beautiful product'),
(2,2,4,'Good quality'),
(3,3,5,'Very satisfied'),
(4,4,3,'Average'),
(5,5,4,'Will buy again'),
(6,6,5,'Beautiful and durable'),
(7,7,4,'Reasonable price'),
(8,8,5,'Excellent'),
(9,9,4,'Very nice'),
(10,10,5,'Good product');