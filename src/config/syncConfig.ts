// Fixed configuration for Google Sheets Synchronization and Google Apps Script
// User provided fixed Web App URL:
// https://script.google.com/macros/s/AKfycbw4zhlHo7I5wJYTOP2nq8E3SKzGs9xCwOoGJJH76WgbiIg0veAjleWCnTLqkr-5VNsG/exec

export const FIXED_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbw4zhlHo7I5wJYTOP2nq8E3SKzGs9xCwOoGJJH76WgbiIg0veAjleWCnTLqkr-5VNsG/exec';

export const isValidAppsScriptUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://script.google.com/macros/s/')) return false;
  if (trimmed.includes('AKfycbz_ag_notepad_sync')) return false;
  if (trimmed.includes('...')) return false;
  const match = trimmed.match(/\/macros\/s\/([a-zA-Z0-9_-]+)/);
  return !!match && match[1].length >= 25;
};

export const GOOGLE_SHEET_ID = '1J6xput_hnyroayLrDKJn-mGYn0xDLqTEs_gSrLzWJJI';
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit`;

export const APPS_SCRIPT_SOURCE_CODE = `function doGet(e) {
  var sheet = SpreadsheetApp.openById("${GOOGLE_SHEET_ID}").getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var data = [];
  var startRow = (rows.length > 0 && rows[0][0] === "Datetime") ? 1 : 0;
  for (var i = startRow; i < rows.length; i++) {
    var row = rows[i];
    if (row[4] !== "DELETE" && row[1]) {
      data.push({
        datetime: row[0] || "",
        notename: row[1] || "Untitled",
        category: row[2] || "General",
        note: row[3] || "",
        action: row[4] || "CREATE"
      });
    }
  }
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.openById("${GOOGLE_SHEET_ID}").getActiveSheet();
  try {
    var data = JSON.parse(e.postData.contents);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Datetime", "Notename", "Category", "Note", "Action"]);
    }
    var actionType = data.action || "CREATE";
    if (actionType === "DELETE") {
      var rows = sheet.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (rows[i][1] === data.notename) {
          sheet.deleteRow(i + 1);
        }
      }
    } else {
      sheet.appendRow([
        data.datetime || new Date().toLocaleString(),
        data.notename || "Untitled",
        data.category || "General",
        data.note || "",
        actionType
      ]);
    }
    return ContentService.createTextOutput(JSON.stringify({"status": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
