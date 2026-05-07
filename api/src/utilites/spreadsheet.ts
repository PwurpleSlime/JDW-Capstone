import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from 'google-auth-library'

function getDoc(){
    if (!process.env.GOOGLE_SERVICE_ACCOUNT) throw "Failed to get Google Service Account"
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)

    const serviceAccountAuth = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.readonly",
    ],
    });
    if (!process.env.GOOGLE_SPREADSHEET_URL_ID) throw "Failed to get Google Spreadsheet URL id"
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_URL_ID!, serviceAccountAuth)
    return doc
}
export async function getGoogleSheet(selectedSheetByIndex: number){
    const doc = getDoc()
    await doc.loadInfo()
    console.log(`Doc Title: ${doc.title}`)

    const sheet = doc.sheetsByIndex[selectedSheetByIndex]
    // console.log(sheet)

    if (!sheet) {
        throw new Error(`Sheet at index ${selectedSheetByIndex} not found. Available sheets: ${doc.sheetsByIndex.length}`)
    }

    console.log(`Sheet Title: ${sheet.title}`)
    const rows = await sheet.getRows()
    console.log(rows.map(row => row.toObject()))
    return rows.map(row => row.toObject())
}
