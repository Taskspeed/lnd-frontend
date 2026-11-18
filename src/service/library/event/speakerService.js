import { api } from "src/boot/axios";

// Hindi puwede ang JSON kapag may file, kaya FormData ang gamit.
// Ang null/undefined ay ipinapadala bilang "" at ginagawang null ng Laravel
// (ConvertEmptyStringsToNull).
function toFormData(payload = {}, photoFile = null, extras = {}) {
  const fd = new FormData();

  Object.entries({ ...payload, ...extras }).forEach(([key, value]) => {
    fd.append(key, value ?? "");
  });

  if (photoFile) fd.append("profile_photo", photoFile);

  return fd;
}

const multipart = { headers: { "Content-Type": "multipart/form-data" } };

// GET all speakers
export const speaker_name = () => {
  return api.get(`speaker`);
};

// CREATE speaker (may optional na litrato)
export const create_speaker = (payload, photoFile = null) => {
  return api.post(`speaker/store`, toFormData(payload, photoFile), multipart);
};

// UPDATE speaker
// POST na may _method=PUT ang gamit, kasi hindi nababasa ng PHP ang multipart
// na totoong PUT request. Nananatiling Route::put ang route sa Laravel.
export const update_speaker = (
  speakerId,
  payload,
  photoFile = null,
  removePhoto = false
) => {
  const extras = { _method: "PUT" };
  if (removePhoto) extras.remove_photo = 1;

  return api.post(
    `speaker/update/${speakerId}`,
    toFormData(payload, photoFile, extras),
    multipart
  );
};

// DELETE speaker
export const delete_speaker = (speakerId) => {
  return api.delete(`speaker/delete/${speakerId}`);
};

export const view_speaker = (speakerId) => {
  return api.get(`speaker/show/${speakerId}`);
};

export const fetch_speaker = (search = '') => {
  return api.get(`speaker/fetch`,{
      params: { search } ,
  });
};

// History ng speaker: search = pangalan ng event, page at per_page para sa pagination
export const history_speaker = (speakerId, search = '', page = 1, perPage = 5) => {
  return api.get(`speaker/history/${speakerId}`, {
    params: { search, page, per_page: perPage },
  });
};