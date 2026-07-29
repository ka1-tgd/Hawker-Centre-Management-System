// Require Node modules and dbConfig
const sql = require("mssql");
const dbConfig = require("../../dbConfig");

// Get rental agreement by stall
async function getRentalAgreementByStall(stallId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `
            SELECT RentalAgreement.agreement_id, 
            RentalAgreement.stall_id, 
            Stall.stall_name, 
            RentalAgreement.start_date, 
            RentalAgreement.end_date, 
            RentalAgreement.monthly_rent, 
            RentalAgreement.payment_status, 
            RentalAgreement.agreement_status
            FROM RentalAgreement
            INNER JOIN Stall
            ON RentalAgreement.stall_id = Stall.stall_id
            WHERE
            RentalAgreement.stall_id = @stall_id
            AND Stall.user_id = @user_id;`;
        const request = connection.request();
        request.input("stall_id", stallId);
        request.input("user_id", userId);
        const result = await request.query(query);
        if (result.recordset.length === 0)
            return null;
        return result.recordset[0];

    }
    catch (error) {
        console.error("Database error:", error);
        throw error;
    }
    finally {
        if (connection)
            await connection.close();
    }
}

// Pay Rental Agreement
async function payRentalAgreement(stallId, userId) {
    let connection;
    try {
        connection = await sql.connect(dbConfig);
        const query = `UPDATE RentalAgreement SET payment_status = 'Paid', agreement_status = 'Active' FROM RentalAgreement INNER JOIN Stall ON RentalAgreement.stall_id = Stall.stall_id 
        WHERE RentalAgreement.stall_id = @stall_id AND Stall.user_id = @user_id;`;

        const request = connection.request();
        request.input("stall_id", stallId);
        request.input("user_id", userId);

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0)
            return null;
        return await getRentalAgreementByStall(stallId, userId);

    }
    catch (error) {
        console.error("Database error:", error);
        throw error;
    }
    finally {
        if (connection)
            await connection.close();
    }
}

module.exports = {
    getRentalAgreementByStall,
    payRentalAgreement
};