export const fetchDriveImages = async () => {
  const API_KEY = import.meta.env.VITE_DRIVE_API_KEY;
  const FOLDER_ID = import.meta.env.VITE_DRIVE_FOLDER_ID;

  // Query để lấy file trong folder, chỉ ảnh
  const endpoint = `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webViewLink)`;

  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (!data.files) {
      console.error("No files returned", data);
      return [];
    }

    const images = data.files.map((file: any) => {
      // ưu tiên thumbnailLink, fallback link full size
      return file.thumbnailLink || `https://drive.google.com/uc?export=view&id=${file.id}`;
    });

    return images;
  } catch (error) {
    console.error("Error fetching Drive images:", error);
    return [];
  }
};
