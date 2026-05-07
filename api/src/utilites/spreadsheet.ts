import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from 'google-auth-library'

function getDoc(){
    if (!process.env.GOOGLE_SERVICE_PRIVATE_KEY) throw "Failed to get Google Service Account Private Key Env"
    if (!process.env.GOOGLE_SERVICE_CLIENT_EMAIL) throw "Failed to get Google Service Account Client Email ENV"
    
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_CLIENT_EMAIL,
        key: process.env.GOOGLE_SERVICE_PRIVATE_KEY,
        scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.readonly",
    ],
    })
    if (!process.env.GOOGLE_SPREADSHEET_URL_ID) throw "Failed to get Google Spreadsheet URL id"
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_URL_ID!, serviceAccountAuth)
    return doc
}
export async function getGoogleSheet(selectedSheetByIndex: number){
    const doc = getDoc()
    await doc.loadInfo()
    console.log(`Doc Title: ${doc.title}`)

    const sheet = doc.sheetsByIndex[selectedSheetByIndex]

    if (!sheet) {
        throw new Error(`Sheet at index ${selectedSheetByIndex} not found. Available sheets: ${doc.sheetsByIndex.length}`)
    }

    console.log(`Sheet Title: ${sheet.title}`)
    const rows = await sheet.getRows()
    return rows.map(row => row.toObject())
}
