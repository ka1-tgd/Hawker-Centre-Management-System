-- This file contains the queries to make the database and insert data that will be used for the BED/SPM Final Assignment
-- Group 4:
-- Ang Yi Kai (S10272677A)
--     Tables: Users
-- Goh Yi Xuan (S10273687C)
--     Tables: Rewards, LoyaltyPoints, RedemptionHistory, Feedback,MenuItemLikes
-- Ryan Melvin Rajah (S10275110B)
--     Tables: Stall, Menu, MenuItem
-- Tham Shao Heng (S10275177C)
--     Tables: HawkerCentre, CustOrder, OrderItem
-- Zeng Wen Shuang (S10275183K) 
--     Tables: Inspection, Hygiene_Grade,Complaints

-- Create Database
CREATE DATABASE BEDSPMAssignment_db;
USE BEDSPMAssignment_db;

-- Create Tables
CREATE TABLE Users (
	user_id INT IDENTITY(1,1) NOT NULL,
	name VARCHAR(255) NOT NULL,
	contact_no VARCHAR(8) NOT NULL,
	email VARCHAR(255) NOT NULL,
	passwordHash VARCHAR(255) NOT NULL,
	role VARCHAR(50) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'active',
	CONSTRAINT PK_Users PRIMARY KEY (user_id),
	CONSTRAINT CK_Role_Users CHECK (role in ('customer','hawker','officer')),
    CONSTRAINT CK_Status_Users CHECK (status in ('active', 'deleted'))
);

CREATE TABLE HawkerCentre (
	hawker_centre_id INT NOT NULL,
	hawker_centre_name VARCHAR(50) NOT NULL,
	hawker_centre_address VARCHAR(100) NOT NULL,
	CONSTRAINT PK_HawkerCentre PRIMARY KEY (hawker_centre_id)
);

CREATE TABLE Stall (
    stall_id INT NOT NULL,
    user_id INT NOT NULL,
	hawker_centre_id INT NOT NULL,
    stall_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    operating_hours VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
	CONSTRAINT PK_Stall PRIMARY KEY (stall_id),
    CONSTRAINT FK_Stall_user FOREIGN KEY (user_id) REFERENCES Users(user_id),
	CONSTRAINT FK_Stall_hawker_centre FOREIGN KEY (hawker_centre_id) REFERENCES HawkerCentre(hawker_centre_id),
	CONSTRAINT CK_Stall CHECK (status in ('Open', 'Close'))
);

CREATE TABLE Menu (
	menu_id INT NOT NULL,
	stall_id INT NOT NULL,
	CONSTRAINT PK_Menu PRIMARY KEY (menu_id),
	CONSTRAINT FK_Menu FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
);

CREATE TABLE MenuItem (
    menu_item_id INT IDENTITY(1,1) NOT NULL,
    menu_id INT NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    availability CHAR(1) NOT NULL,
	CONSTRAINT PK_MenuItem PRIMARY KEY (menu_item_id),
    CONSTRAINT FK_MenuItem FOREIGN KEY (menu_id) REFERENCES Menu(menu_id),
	CONSTRAINT CK_MenuItem CHECK (availability in ('Y', 'N'))
);

CREATE TABLE CustOrder (
	order_id INT IDENTITY(1,1) NOT NULL,
	order_date DATETIME NOT NULL DEFAULT GETDATE(), 
    total_amount DECIMAL(10,2),
	payment_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
	user_id INT NOT NULL,
	CONSTRAINT PK_CustOrder PRIMARY KEY (order_id),
    CONSTRAINT FK_CustOrder FOREIGN KEY (user_id) REFERENCES Users(user_id),
	CONSTRAINT CK_CustOrder_payment CHECK (payment_type in ('Cash', 'Card', 'PayNow')),
    CONSTRAINT CK_CustOrder_status CHECK (status in ('Pending', 'Preparing', 'Completed', 'Cancelled'))
);

CREATE TABLE OrderItem (
	order_id INT NOT NULL,
	order_item_no INT IDENTITY(1,1) NOT NULL,
	stall_id INT NOT NULL,
	menu_item_id INT NOT NULL,
	quantity INT NOT NULL,
	unit_price DECIMAL(10,2),
	CONSTRAINT PK_OrderItem PRIMARY KEY (order_id, order_item_no),
    CONSTRAINT FK_OrderItem_order FOREIGN KEY (order_id) REFERENCES CustOrder(order_id),
	CONSTRAINT FK_OrderItem_stall FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
	CONSTRAINT FK_OrderItem_menu_item FOREIGN KEY (menu_item_id) REFERENCES MenuItem(menu_item_id)
);

CREATE TABLE Inspection (
	inspection_id INT IDENTITY(1,1) NOT NULL,
	inspection_date DATETIME NOT NULL,
	score INT NOT NULL,
	remarks VARCHAR(MAX) NULL,
	created_at DATETIME NOT NULL DEFAULT GETDATE(),
	updated_at DATETIME NOT NULL DEFAULT GETDATE(),
	stall_id INT NOT NULL,
	user_id INT NOT NULL,
	CONSTRAINT PK_Inspection PRIMARY KEY (inspection_id),
	CONSTRAINT FK_Stall_Inspection FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
	CONSTRAINT FK_User_Inspection FOREIGN KEY (user_id) REFERENCES Users(user_id),
	CONSTRAINT CK_Inspection CHECK (score BETWEEN 0 and 100)
);

CREATE TABLE Hygiene_Grade (
	grade_id INT IDENTITY(1,1) NOT NULL,
	grade CHAR(1) NOT NULL,
	valid_from DATE NOT NULL,
	expiry DATE NULL,
	stall_id INT NOT NULL,
	inspection_id INT NOT NULL
	CONSTRAINT PK_Hygiene PRIMARY KEY (grade_id),
	CONSTRAINT FK_Stall_Hygiene FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
	CONSTRAINT FK_Inspect_Hygiene FOREIGN KEY (inspection_id) REFERENCES Inspection(inspection_id),
	CONSTRAINT CK_Hygiene CHECK (grade IN ('A', 'B', 'C', 'D'))
);
 
CREATE TABLE LoyaltyPoints (
    LoyaltyID       INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT NOT NULL,
    CurrentPoints   INT NOT NULL DEFAULT 0,
    Tier            VARCHAR(20) NOT NULL DEFAULT 'Bronze',
    LastUpdated     DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_LoyaltyPoints_User FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT CK_LoyaltyPoints CHECK (Tier in ('Gold', 'Silver', 'Bronze'))
);
 
CREATE TABLE Reward (
    RewardID        INT IDENTITY(1,1) PRIMARY KEY,
    RewardName      VARCHAR(100) NOT NULL,
    PointsRequired  INT NOT NULL,
    DiscountType    VARCHAR(30) NOT NULL,
    DiscountValue   DECIMAL(5,2) NOT NULL,
    Description     VARCHAR(255) NULL,
    IsActive VARCHAR(10) NOT NULL DEFAULT 'Active',
    CONSTRAINT CK_Reward CHECK (IsActive in ('Active', 'Inactive'))
);
 
CREATE TABLE RedemptionHistory (
    RedemptionID    INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT NOT NULL,
    RewardID        INT NOT NULL,
    RedeemedDate    DATETIME NOT NULL DEFAULT GETDATE(),
    PointsUsed      INT NOT NULL,
    CONSTRAINT FK_Redemption_Customer FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Redemption_Reward FOREIGN KEY (RewardID) REFERENCES Reward(RewardID)
);
 
CREATE TABLE Feedback (
    FeedbackID      INT IDENTITY(1,1) PRIMARY KEY,
    order_id         INT NOT NULL,
    user_id      INT NOT NULL,
    stall_id         INT NOT NULL,
    Rating          INT NOT NULL,
    Comment         VARCHAR(500) NULL,
    CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate     DATETIME NULL,
    CONSTRAINT FK_Feedback_Order FOREIGN KEY (order_id) REFERENCES CustOrder(order_id),
    CONSTRAINT FK_Feedback_Customer FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Feedback_Stall FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
    CONSTRAINT CK_Feedback_Rating CHECK (Rating BETWEEN 1 AND 5)
);
 
CREATE TABLE MenuItemLike (
    LikeID          INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT NOT NULL,
    menu_item_id      INT NOT NULL,
    CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Like_Customer FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Like_MenuItem FOREIGN KEY (menu_item_id) REFERENCES MenuItem(menu_item_id)
);

CREATE TABLE Complaint (
    ComplaintID     INT IDENTITY(1,1) PRIMARY KEY,
    order_id         INT NOT NULL,
    user_id      INT NOT NULL,
    stall_id         INT NOT NULL,
    Category        VARCHAR(50) NOT NULL,
    Description     VARCHAR(500) NOT NULL,
    Status          VARCHAR(30) NOT NULL DEFAULT 'Pending',
    CreatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
    ResolvedDate    DATETIME NULL,
    CONSTRAINT FK_Complaint_Order FOREIGN KEY (order_id) REFERENCES CustOrder(order_id),
    CONSTRAINT FK_Complaint_Customer FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT FK_Complaint_Stall FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
    CONSTRAINT CK_Complaint_Category CHECK (Category in ('Food Quality', 'Wrong Order', 'Price', 'Long Waiting Time', 'Hygiene')),
    CONSTRAINT CK_Complaint_Status CHECK (Status in ('Pending', 'In Progress', 'Resolved', 'Rejected'))
);
GO

CREATE TABLE RentalAgreement (
    agreement_id INT NOT NULL,
    stall_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    agreement_status VARCHAR(20) NOT NULL,
    CONSTRAINT PK_RentalAgreement PRIMARY KEY (agreement_id),
    CONSTRAINT FK_RentalAgreement_Stall FOREIGN KEY (stall_id) REFERENCES Stall(stall_id),
    CONSTRAINT CK_RentalAgreement_Payment CHECK (payment_status IN ('Paid', 'Unpaid')),
    CONSTRAINT CK_RentalAgreement_Status CHECK (agreement_status IN ('Active', 'Pending', 'Expired'))
);

-- Insert Values

INSERT INTO Users (name, contact_no, email, passwordHash, role)
    VALUES
    ('John', '12345678', 'john_99@mail.com', '$2b$10$TIXYb4YXoXEuVRuP5yfjiOt./DCTljplSN6hzjqv9pRNrNtfZRvMq', 'hawker'),
    ('Amanda', '87654321', 'amanda_88@mail.com', '$2b$10$eV7K1EU8BK/Rsoxgv54zw.HR0T9qeczL7CAZP2W8MAfahkTIEyhDG', 'hawker'),
    ('Charlie', '11223344', 'charlie_c@mail.com', '$2b$10$qJlAMjJTJPtfRdnBLFhRFuFzDB2zZZwmANIS8GNOOzOTiw6macA0W', 'officer'),
    ('David', '66778899', 'david_d@mail.com', '$2b$10$RswsaokubDUsdP3gGqJ.jOtorNcX3mX1N4jN4oE499U65rVJYFmLq', 'officer'),
    ('Janice', '12131415', 'janice_j@mail.com', '$2b$10$pYefJPCbkRra.KUYpRYzkuLvG4QMZlc3TpPBtpeGIC1s8j.xd0w9u', 'customer'),
    ('Ryan', '77498756', 'ryanhiga_1M@mail.com', '$2b$10$Hs70lMENn.rDcGiQgVbIteVs/0m7TR/oazYOMBd3x/tZNJ8E5adRe', 'customer'),
    ('Tung', '77735678', 'tungtt@mail.com', '$2b$10$2ng6Y7K2f7Tp0ynQz4Blz.mIak76feRIOVejtdMqiSoTZFFD4Gp0a', 'hawker');

INSERT INTO HawkerCentre (hawker_centre_id, hawker_centre_name, hawker_centre_address)
    VALUES
    (1, 'Maxwell Food Centre', '1 Kadayanallur St, Singapore 069184'),
    (2, 'Old Airport Road Food Centre', '51 Old Airport Rd, Singapore 390051'),
    (3, 'Chinatown Complex Food Centre', '46 Smith St, Singapore 058956'),
    (4, 'Lau Pa Sat', '18 Raffles Quay, Singapore 048582');

INSERT INTO Stall (stall_id, user_id, hawker_centre_id, stall_name, description, operating_hours, contact_number, status)
    VALUES
    (1, 1, 1, 'Ah Heng Chicken Rice', 'Famous roasted and steamed chicken rice.', '8:00 AM - 8:00 PM', '91234567', 'Open'),
    (2, 2, 1, 'National Nasi Lemak Association', 'Traditional nasi lemak with various side dishes.', '7:00 AM - 3:00 PM', '92345678', 'Open'),
    (3, 7, 2, 'Resident Prata House', 'Freshly made prata with authentic curry.', '6:00 AM - 11:00 PM', '93456789', 'Close');

INSERT INTO Menu (menu_id, stall_id)
    VALUES
    (1, 1),
    (2, 2),
    (3, 3);

INSERT INTO Menu (menu_id, stall_id)
VALUES
(4,4),
(5,6),
(6,7),
(7,9),
(8,10);

INSERT INTO MenuItem (menu_id, item_name, description, price, category, availability)
    VALUES
    -- Ah Heng Chicken Rice (Menu 1)
    (1, 'Roasted Chicken Rice', 'Roasted chicken with fragrant rice', 5.50, 'Main Course', 'Y'),
    (1, 'Steamed Chicken Rice', 'Tender steamed chicken with rice', 5.50, 'Main Course', 'Y'),
    (1, 'Chicken Drumstick Rice', 'Roasted drumstick with rice', 6.50, 'Main Course', 'N'),
    (1, 'Chicken Soup', 'Traditional herbal soup', 2.00, 'Soup', 'Y'),
    (1, 'Braised Tofu', 'Homemade braised tofu', 2.50, 'Side Dish', 'N'),
    (1, 'Iced Lemon Tea', 'Refreshing iced lemon tea', 2.00, 'Drink', 'Y'),
 
    -- National Nasi Lemak Association (Menu 2)
    (2, 'Nasi Lemak Chicken Wing', 'Coconut rice with crispy chicken wing', 6.00, 'Main Course', 'Y'),
    (2, 'Nasi Lemak Fish Fillet', 'Coconut rice with fish fillet', 6.50, 'Main Course', 'Y'),
    (2, 'Nasi Lemak Otah', 'Coconut rice with otah', 5.50, 'Main Course', 'Y'),
    (2, 'Teh Tarik', 'Pulled milk tea', 1.80, 'Drink', 'Y'),
    (2, 'Bandung', 'Rose syrup milk drink', 2.00, 'Drink', 'Y'),
    (2, 'Curry Puff', 'Crispy curry puff', 1.50, 'Snack', 'Y'),
 
    -- Resident Prata House (Menu 3)
    (3, 'Plain Prata', 'Crispy prata served with curry', 2.00, 'Main Course', 'Y'),
    (3, 'Egg Prata', 'Prata with egg filling', 3.00, 'Main Course', 'Y'),
    (3, 'Cheese Prata', 'Prata with melted cheese', 4.00, 'Main Course', 'Y'),
    (3, 'Mutton Curry', 'Spicy mutton curry', 6.50, 'Side Dish', 'Y'),
    (3, 'Milo Dinosaur', 'Cold Milo with extra Milo powder', 3.00, 'Drink', 'Y'),
    (3, 'Coin Prata', 'Mini crispy prata bites', 4.50, 'Snack', 'N');

INSERT INTO CustOrder (user_id, total_amount, payment_type, status, order_date)
    VALUES
    (5, 7.50, 'Card', 'Completed', '2026-06-01'),
    (5, 6.00, 'Cash', 'Pending', '2026-07-02'),
    (6, 6.50, 'PayNow', 'Completed', '2026-07-02');

INSERT INTO OrderItem (order_id, stall_id, menu_item_id, quantity, unit_price)
    VALUES
    (1, 1, 1, 1, 5.50),
    (1, 1, 4, 1, 2.00),
    (2, 3, 14, 2, 6.00),
    (3, 1, 3, 1, 6.50);

INSERT INTO Inspection (stall_id, user_id, inspection_date, score, remarks)
    VALUES 
    (1, 3, '2026-03-15', 92, 'Excellent cleanliness, no issues found'),
    (1, 3, '2026-06-10', 78, 'Minor grease buildup near stove, advised cleaning'),
    (2, 3, '2026-04-02', 65, 'Food storage temperature slightly high'),
    (2, 4, '2026-07-01', 88, 'Improved since last inspection');
 
INSERT INTO Hygiene_Grade (stall_id, inspection_id, grade, valid_from, expiry)
    VALUES
    (1, 1, 'A', '2026-03-15', '2026-06-09'),
    (1, 2, 'B', '2026-06-10', NULL),
    (2, 3, 'C', '2026-04-02', '2026-06-30'),
    (2, 4, 'A', '2026-07-01', NULL);

INSERT INTO LoyaltyPoints (user_id, CurrentPoints, Tier)
    VALUES
    (5, 180, 'Silver'),
    (6, 250, 'Gold');
 
INSERT INTO Reward 
(RewardName, PointsRequired, DiscountType, DiscountValue, Description, IsActive)
    VALUES
    ('Free Drink', 50, 'Free Item', 0, 'Redeem a free drink from participating stalls.', 'Active'),
    ('Free Side Dish', 80, 'Free Item', 0, 'Redeem a free side dish with your meal.', 'Active'),
    ('5% Discount Voucher', 100, 'Percentage', 5, 'Receive 5% discount on your next order.', 'Active'),
    ('10% Discount Voucher', 150, 'Percentage', 10, 'Receive 10% discount on your next order.', 'Active'),
    ('$5 Meal Voucher', 200, 'Fixed Amount', 5, 'Redeem a $5 meal voucher from selected stalls.', 'Active'),
    ('Free Meal Set', 300, 'Free Item', 0, 'Redeem a complete meal set from participating stalls.', 'Inactive');

-- Reworded reward descriptions
UPDATE Reward SET Description = 'Show this at the stall to receive 5% off your order.' WHERE RewardName = '5% Discount Voucher';
UPDATE Reward SET Description = 'Show this at the stall to receive 10% off your order.' WHERE RewardName = '10% Discount Voucher';
UPDATE Reward SET Description = 'Show this at the stall to receive $5 off your meal.' WHERE RewardName = '$5 Meal Voucher';
 
INSERT INTO RedemptionHistory (user_id, RewardID, PointsUsed)
    VALUES
    (5, 1, 50),
    (5, 3, 100),
    (5, 4, 150),
    (6, 1, 50),
    (6, 2, 80);

INSERT INTO Feedback (order_id, user_id, stall_id, Rating, Comment, CreatedDate)
    VALUES
    (1, 5, 1, 4, 'Absolute chicken rice perfection, delicious and affordable!', '2026-06-11'),
    (2, 5, 3, 3, 'Great food, but the stall looks kind of dirty.', '2026-07-02'),
    (3, 6, 1, 4, 'The chicken rice tastes great, but the wait was quite long.', '2026-07-02');

INSERT INTO MenuItemLike (user_id, menu_item_id, CreatedDate)
    VALUES
    (5, 1, '2026-06-03'),
    (5, 4, '2026-06-03'),
    (5, 14, '2026-07-02'),
    (6, 3, '2026-07-02');

INSERT INTO Complaint (order_id, user_id, stall_id, Category, Description, Status, CreatedDate, ResolvedDate)
    VALUES
    (2, 5, 3, 'Hygiene', 'The stall looks completely unsanitary.', 'Pending', '2026-07-02', NULL),
    (3, 6, 1, 'Long Waiting Time', 'Foods were served slow.', 'Pending', '2026-07-02', NULL);

INSERT INTO RentalAgreement (agreement_id, stall_id, start_date, end_date, monthly_rent, payment_status, agreement_status)
VALUES
    (1, 1, '2026-01-01', '2026-12-31', 1200.00, 'Paid', 'Active'),
    (2, 2, '2026-01-01', '2026-12-31', 1350.00, 'Paid', 'Active'),
    (3, 3, '2026-01-01', '2026-12-31', 1100.00, 'Unpaid', 'Active'),
    (4, 4, '2026-01-01', '2026-12-31', 1250.00, 'Paid', 'Active'),
    (5, 6, '2026-01-01', '2026-12-31', 1400.00, 'Paid', 'Active'),
    (6, 7, '2026-01-01', '2026-12-31', 1150.00, 'Unpaid', 'Pending'),
    (7, 9, '2026-01-01', '2026-12-31', 1500.00, 'Paid', 'Active'),
    (8, 10, '2026-01-01', '2026-12-31', 1300.00, 'Paid', 'Active'),
    (9, 11, '2026-01-01', '2026-12-31', 1000.00, 'Unpaid', 'Pending');
SELECT * FROM Inspection

INSERT INTO Inspection (stall_id, user_id, inspection_date, score, remarks)
VALUES (3, 3, '2026-07-20', 70, 'Routine inspection, satisfactory condition');

INSERT INTO Hygiene_Grade (stall_id, inspection_id, grade, valid_from, expiry)
VALUES (3, (SELECT MAX(inspection_id) FROM Inspection WHERE stall_id = 3), 'C', '2026-07-20', DATEADD(DAY, 15, GETDATE()));

UPDATE CustOrder SET order_date = '2026-07-14 12:30:00' WHERE order_id = 1;
UPDATE CustOrder SET order_date = '2026-07-14 18:45:00' WHERE order_id = 3;
UPDATE CustOrder SET order_date = '2026-07-14 09:15:00' WHERE order_id = 4;
