export const getGuestId = () => {
  let guestId = localStorage.getItem('guestId');
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('guestId', guestId);
  }
  return guestId;
};

const ANIMAL_NAMES = [
  'Ngựa ẩn danh', 'Dê vui vẻ', 'Cáo lém lỉnh', 'Gấu ngái ngủ', 
  'Thỏ dũng cảm', 'Sói ngầu lòi', 'Hươu thông thái', 'Mèo lười biếng',
  'Cừu hiền lành', 'Lạc đà kiên nhẫn', 'Hải cẩu tinh nghịch',
  'Chim cánh cụt mập', 'Gấu trúc lơ ngơ', 'Cún đáng yêu', 'Ếch cốm',
  'Cú đêm', 'Sóc lanh lợi', 'Hổ báo cáo chồn', 'Voi con', 'Bò sữa'
];

export const getGuestName = () => {
  let guestName = localStorage.getItem('guestName');
  if (!guestName) {
    guestName = ANIMAL_NAMES[Math.floor(Math.random() * ANIMAL_NAMES.length)];
    localStorage.setItem('guestName', guestName);
  }
  return guestName;
};
