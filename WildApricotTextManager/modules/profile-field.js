export async function getLanguage(accountNumber, clientId, language_field) {
  try {
    let selectedLanguage = await fetch(
      `/sys/api/v2/accounts/${accountNumber}/contacts/me`,
      {
        headers: { clientId: clientId },
      }
    )
      .then((res) => res.json())
      .then((response) => {
        return fetch(
          `/sys/api/v2/accounts/${accountNumber}/contacts/${response.Id}`,
          {
            headers: { clientId: clientId },
          }
        )
          .then((res) => res.json())
          .then((response) => {
            let field = response.FieldValues.find(
              (f) => f.FieldName === language_field
            );
            if (field) field = field.Value.Label;
            else field = "";
            return field;
          })
          .catch((err) => {
            console.log(err);
            return "";
          });
      })
      .catch((err) => {
        console.log(err);
        return "";
      });
    setCookie("profileLanguage", true);
    return selectedLanguage;
  } catch (err) {
    console.log(err);
    return "";
  }
}

export function checked() {
  // Read selected language from cookie
  let cookieSet = getCookie("profileLanguage");
  if (!cookieSet) return false;
  else return true;
}

// Util function for setting cookies
const setCookie = (key, value) => {
  var expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie =
    key + "=" + value + ";path=/;expires=" + expires.toUTCString();
};

// Util function for reading cookies
const getCookie = (key) => {
  var keyValue = document.cookie.match("(^|;) ?" + key + "=([^;]*)(;|$)");
  if (keyValue && keyValue.length > 0) {
    keyValue = keyValue[2];

    if (!isNaN(keyValue)) {
      keyValue = Number(keyValue);
    } else if (keyValue.toLowerCase() == "true") {
      keyValue = true;
    } else if (keyValue.toLowerCase() == "false") {
      keyValue = false;
    }
  }
  return keyValue;
};
