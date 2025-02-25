async function submitForm(event) {
  event.preventDefault();
  
  var recaptchaResponse = grecaptcha.enterprise.getResponse();
  if (recaptchaResponse.length === 0) {
    return;
  }

  const form = document.getElementById('ContactForm');
  const formData = new FormData(form);
  const jsonObject = {};
  formData.forEach((value, key) => {
    jsonObject[key] = value;
  });

  const country_code = jsonObject["country_code"] || "";
  const phone_number = jsonObject["phone"] || "";
  jsonObject["phone"] = country_code + phone_number;

  const company_size = jsonObject["company_size"] || "";
  const llmsUsed = jsonObject["llmsUsed"] || "";
  jsonObject["00NJ600000A9Vbn"] = company_size;
  jsonObject["00NJ600000A9Vbx"] = llmsUsed;
  delete jsonObject["company_size"];
  delete jsonObject["country_code"];

  const fullName = jsonObject["fullName"].trim();
  const nameParts = fullName.split(" ");
  if (nameParts.length < 2) {
    return;
  }
  jsonObject["first_name"] = nameParts[0];
  jsonObject["last_name"] = nameParts.slice(1).join(" ");
  delete jsonObject["fullName"];

  jsonObject["g-recaptcha-response"] = recaptchaResponse;
  
  const finalEncodedData = new URLSearchParams(jsonObject).toString();
  const submitScreenHTML  = '<div style="text-align: center; font-size: 12px; padding: 20px; max-width: 500px;">Thank you!<br/>We’ll be in touch as soon as possible if we’re a good fit.<br/>In the meantime, get to know <strong>nexos.ai</strong> a little better.<br><br><a href="https://nexos.ai/blog" target="_blank">Check Out Our Blog</a></div>';
  const submitContainerStyle = 'display: flex; justify-content: center; align-items: center; height: 100%;'
  fetch("https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: finalEncodedData
  })
  .then(response => {
    document.querySelector('.form-container').setAttribute('style',submitContainerStyle ); 
    document.querySelector('.form-container').innerHTML = submitScreenHTML;
  })
  .catch(error => {
    document.querySelector('.form-container').setAttribute('style', submitContainerStyle); 
    document.querySelector('.form-container').innerHTML = submitScreenHTML ;
  });
}
