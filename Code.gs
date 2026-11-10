/**
 * ===================================================================
 * GOOGLE APPS SCRIPT: HỆ THỐNG THU THẬP ĐIỂM SỐ HỌC SINH TỰ ĐỘNG
 * Môn: Khoa Học Tự Nhiên 9 - Bài 23: Alkane (Bộ Sách Kết Nối Tri Thức)
 * ===================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT TRONG 1 PHÚT:
 * 1. Mở một Google Trang tính (Google Sheets) mới, đặt tên: "KHTN 9 - Điểm Bài 23 Alkane".
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) ➔ Apps Script.
 * 3. Xóa hết code mặc định và dán toàn bộ nội dung file này vào.
 * 4. Bấm "Lưu" (biểu tượng đĩa mềm 💾).
 * 5. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải ➔ Chọn "Triển khai mới" (New deployment).
 * 6. Bấm vào biểu tượng bánh răng ⚙️ ➔ Chọn loại: "Ứng dụng web" (Web app).
 * 7. Thiết lập thông số:
 *    - Mô tả: Nhận điểm Bài 23 Alkane KHTN 9
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <--- RẤT QUAN TRỌNG
 * 8. Bấm "Triển khai" (Deploy) ➔ Cấp quyền truy cập cho tài khoản Google của bạn.
 * 9. Sao chép "URL ứng dụng web" (có dạng: https://script.google.com/macros/s/.../exec)
 *    và dán vào mục "Cấu hình Google Sheet" trên Website học tập!
 */

// Hàm xử lý khi Website gửi dữ liệu điểm số lên (POST)
function doPost(e) {
  try {
    var sheet = getOrCreateScoreSheet();
    var data = {};

    // 1. Phân tích dữ liệu nhận được (hỗ trợ cả JSON và form-urlencoded)
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    // 2. Trích xuất thông tin học sinh và kết quả
    var timestamp = new Date();
    var timeFormatted = Utilities.formatDate(timestamp, "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var studentName = data.studentName || data.name || "Chưa nhập tên";
    var studentClass = data.studentClass || data.class || "---";
    var score10 = parseFloat(data.score10 !== undefined ? data.score10 : (data.score || 0));
    var correctCount = parseInt(data.correctCount !== undefined ? data.correctCount : 0);
    var totalQuestions = parseInt(data.totalQuestions || 20);
    var percentage = Math.round((correctCount / totalQuestions) * 100);
    var pointsXP = parseInt(data.pointsXP || 0);
    var wrongDetails = data.wrongDetails || "";

    // 3. Xếp loại học lực
    var rank = "Cần cố gắng";
    if (score10 >= 9.0) {
      rank = "Xuất sắc";
    } else if (score10 >= 8.0) {
      rank = "Giỏi";
    } else if (score10 >= 6.5) {
      rank = "Khá";
    } else if (score10 >= 5.0) {
      rank = "Trung bình";
    }

    // 4. Ghi hàng mới vào Google Sheet
    sheet.appendRow([
      timeFormatted,
      studentName,
      studentClass,
      score10,
      correctCount + "/" + totalQuestions,
      percentage + "%",
      rank,
      pointsXP,
      wrongDetails
    ]);

    // 5. Định dạng hàng vừa chèn cho đẹp mắt
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(lastRow, 1, 1, 9);
    range.setFontFamily("Arial");
    range.setFontSize(11);
    range.setVerticalAlignment("middle");

    // Căn giữa các cột thông số
    sheet.getRange(lastRow, 1).setHorizontalAlignment("center"); // Thời gian
    sheet.getRange(lastRow, 3).setHorizontalAlignment("center"); // Lớp
    sheet.getRange(lastRow, 4).setHorizontalAlignment("center").setFontWeight("bold"); // Điểm 10
    sheet.getRange(lastRow, 5).setHorizontalAlignment("center"); // Số câu đúng
    sheet.getRange(lastRow, 6).setHorizontalAlignment("center"); // %
    sheet.getRange(lastRow, 7).setHorizontalAlignment("center").setFontWeight("bold"); // Xếp loại
    sheet.getRange(lastRow, 8).setHorizontalAlignment("center"); // XP

    // Đổi màu ô điểm theo kết quả
    var scoreCell = sheet.getRange(lastRow, 4);
    if (score10 >= 8.0) {
      scoreCell.setBackground("#d1fae5").setFontColor("#065f46"); // Xanh lá
    } else if (score10 >= 5.0) {
      scoreCell.setBackground("#e0f2fe").setFontColor("#075985"); // Xanh lam
    } else {
      scoreCell.setBackground("#ffe4e6").setFontColor("#9f1239"); // Đỏ hồng
    }

    // 6. Trả về kết quả thành công cho trình duyệt
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Đã lưu điểm học sinh " + studentName + " (Lớp " + studentClass + ") thành công!",
      row: lastRow,
      score10: score10
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Lỗi ghi dữ liệu: " + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm kiểm tra khi truy cập link trực tiếp trên trình duyệt (GET)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    title: "Hệ thống Google Apps Script KHTN 9 - Bài 23 Alkane",
    description: "Web App sẵn sàng nhận điểm số học sinh từ website học tập tương tác.",
    serverTime: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss")
  })).setMimeType(ContentService.MimeType.JSON);
}

// Tự động khởi tạo và định dạng bảng điểm nếu trang tính mới tinh
function getOrCreateScoreSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Bảng Điểm Alkane");

  if (!sheet) {
    sheet = ss.getActiveSheet();
    sheet.setName("Bảng Điểm Alkane");
  }

  // Nếu dòng 1 chưa có tiêu đề thì tạo tiêu đề chuẩn
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Thời Gian Nộp",
      "Họ Và Tên Học Sinh",
      "Lớp",
      "Điểm Số (Thang 10)",
      "Số Câu Đúng",
      "Tỷ Lệ Chính Xác",
      "Xếp Loại",
      "Điểm XP",
      "Chi Tiết Câu Sai (Nếu Có)"
    ];

    sheet.appendRow(headers);

    // Định dạng dòng tiêu đề
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#059669"); // Màu xanh Emerald thương hiệu
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);

    // Cố định hàng tiêu đề
    sheet.setFrozenRows(1);

    // Thiết lập độ rộng cột hợp lý
    sheet.setColumnWidth(1, 160); // Thời gian
    sheet.setColumnWidth(2, 200); // Họ tên
    sheet.setColumnWidth(3, 90);  // Lớp
    sheet.setColumnWidth(4, 150); // Điểm 10
    sheet.setColumnWidth(5, 120); // Số câu đúng
    sheet.setColumnWidth(6, 130); // Tỷ lệ %
    sheet.setColumnWidth(7, 120); // Xếp loại
    sheet.setColumnWidth(8, 100); // XP
    sheet.setColumnWidth(9, 280); // Chi tiết câu sai
  }

  return sheet;
}

// Hàm chạy thử nghiệm trực tiếp trên Apps Script (Bấm 'Chạy' để test)
function testSaveScore() {
  var fakeEvent = {
    postData: {
      contents: JSON.stringify({
        studentName: "Nguyễn Văn An (Thử Nghiệm)",
        studentClass: "9A1",
        score10: 9.5,
        correctCount: 19,
        totalQuestions: 20,
        pointsXP: 180,
        wrongDetails: "Câu 13: Cân bằng phản ứng butane"
      })
    }
  };

  var res = doPost(fakeEvent);
  Logger.log(res.getContent());
}
