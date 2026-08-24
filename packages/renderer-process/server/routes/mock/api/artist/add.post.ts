export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  console.log(formData);
});
