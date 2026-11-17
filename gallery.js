const galleryPhotos = [
  { src: "./stationery.jpg", alt: "두 사람의 이름을 새긴 반접이 청첩장과 아이보리 봉투", caption: "청첩장과 봉투" },
  { src: "./envelope.jpg", alt: "봉투를 여미는 분홍 하트 스티커", caption: "봉투에 담은 작은 하트" }
];
const photo = document.getElementById("gallery-photo");
let selected = 0;
function showPhoto(offset) {
  selected = (selected + offset + galleryPhotos.length) % galleryPhotos.length;
  const current = galleryPhotos[selected];
  photo.src = current.src;
  photo.alt = current.alt;
  document.getElementById("gallery-caption").textContent = current.caption;
  document.getElementById("gallery-count").textContent = (selected + 1) + " / " + galleryPhotos.length;
}
document.getElementById("prev").addEventListener("click", () => showPhoto(-1));
document.getElementById("next").addEventListener("click", () => showPhoto(1));
document.getElementById("gallery-controls").hidden = false;
