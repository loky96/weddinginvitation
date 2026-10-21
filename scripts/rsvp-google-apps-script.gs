function doPost(event) {
  var answer;
  try {
    var data = event.parameter;
    var name = String(data.name || '').trim();
    var attending = data.attending;
    var count = Number(data.count);
    if (!name || name.length > 150 || ['Yes', 'No'].indexOf(attending) === -1) throw new Error('Invalid guest');
    if (attending === 'Yes' && (!Number.isInteger(count) || count < 1 || count > 5 || ['Yes', 'No'].indexOf(data.stay) === -1)) throw new Error('Invalid guest details');
    var form = FormApp.openById('14so_ATF84Hj3qZEPtqOqv41A1fbDrvRjdCVOhGfFHVc');
    var response = form.createResponse()
      .withItemResponse(form.getItemById(1739792304).asTextItem().createResponse(name))
      .withItemResponse(form.getItemById(1651778174).asMultipleChoiceItem().createResponse(attending === 'Yes' ? 'Joyfully Accepts' : 'Regretfully Declines'));
    if (attending === 'Yes') {
      response.withItemResponse(form.getItemById(879543394).asListItem().createResponse(String(count)))
        .withItemResponse(form.getItemById(298295765).asMultipleChoiceItem().createResponse(data.stay));
    }
    response.submit();
    answer = { ok: true };
  } catch (error) {
    answer = { ok: false, message: 'We could not save your RSVP. Please try again.' };
  }
  return ContentService.createTextOutput(JSON.stringify(answer)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ ready: true })).setMimeType(ContentService.MimeType.JSON);
}
