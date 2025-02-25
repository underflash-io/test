import * as yup from 'https://cdn.jsdelivr.net/npm/yup@1.6.1/+esm';
const { string, object } = yup;

const schema = object().shape({
  fullName: string()
    .required('Required')
    .matches(/^[a-zA-Z]+ [a-zA-Z]+$/, 'Names should be separated by a space'),
  email: string()
    .required('Business email is required')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Enter a valid business email address')
    .test('business-email', 'Must be a company email', (value) => {
      return value && !value.endsWith('@gmail.com') && !value.endsWith('@yahoo.com') && !value.endsWith('@hotmail.com') && !value.endsWith('@aol.com') && !value.endsWith('@outlook.com') && !value.endsWith('@icloud.com') && !value.endsWith('@gmx.com');
    }),
  country_code: string().nullable(),
  phone: string()
    .nullable()
    .matches(/^\d+$/, "Phone number should contain only numbers")
    .test("phone-length", "Phone number should be longer than 5 digits", (value) => {
      if (!value) return true;
      return value.length > 5;
    }),
  company: string().required('Company name is required'),
  llmsUsed: string().nullable(),
  description: string().nullable(),
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('ContactForm');
  const fields = form.querySelectorAll('.input-field');
  
  // Validate individual field and update its error state.
  async function validateField(field) {
    let errorContainer = field.parentNode;
    if (field.name === "phone" || field.name === "country_code") {
      errorContainer = document.querySelector(".phone-error-container");
    }
    const oldError = errorContainer.querySelector(`.error-message.error-${field.name}`);
    if (oldError) oldError.remove();
    
    const formData = new FormData(form);
    const allValues = Object.fromEntries(formData.entries());
    try {
      await schema.validateAt(field.name, allValues);
      field.classList.remove('error');
    } catch (err) {
      field.classList.add('error');
      const errorEl = document.createElement("div");
      errorEl.className = `error-message error-${field.name}`;
      errorEl.textContent = err.message;
      errorContainer.appendChild(errorEl);
    }
  }
  
  fields.forEach((field) => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('change', () => validateField(field));
  });
  
  const sizeBoxes = document.querySelectorAll('.size-box');
  sizeBoxes.forEach((box) => {
    const radio = box.querySelector('input[type="radio"]');
    box.addEventListener('click', () => {
      sizeBoxes.forEach((b) => b.classList.remove('selected'));
      box.classList.add('selected');
      radio.checked = true;
    });
  });
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelectorAll('.error-message').forEach((el) => el.remove());
    fields.forEach((f) => f.classList.remove('error'));
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    try {
      await schema.validate(values, { abortEarly: false });
      submitForm(e);
    } catch (err) {
      if (err.inner) {
        err.inner.forEach((subErr) => {
          const field = form.querySelector(`[name="${subErr.path}"]`);
          if (field) {
            let errorContainer = field.parentNode;
            const oldError = errorContainer.querySelector(`.error-message.error-${field.name}`);
            if (oldError) oldError.remove();
            const errorEl = document.createElement('div');
            errorEl.className = `error-message error-${field.name}`;
            errorEl.textContent = subErr.message;
            errorContainer.appendChild(errorEl);
            field.classList.add('error');
          }
        });
      }
    }
  });
});
