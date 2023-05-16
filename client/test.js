import axios from 'axios';
let data = JSON.stringify({
  username: 'iconiQ_user',
  password: 'password',
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://6b51-180-191-146-188.ngrok-free.app/users/login',
  headers: {
    'Content-Type': 'application/json',
  },
  data: data,
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
