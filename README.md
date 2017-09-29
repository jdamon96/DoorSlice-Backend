# DoorSlice-Backend
Coded June/July 2016.

DoorSlice was a collaborative project with https://github.com/Anteloper that allowed users to order pizza with a single tap. The front end iOS source code is available at https://github.com/Anteloper/DoorSlice. 

The backend is a RESTful API implemented in nodejs using express. The application uses four models/controllers: users, orders, cards (user's credit card information), and addresses. API responses are JSON.

## Endpoints

**User**:

| URL           | HTTP Request  | Description  | Request Requirements |
| ------------- |:-------------:| ------------:| --------------------:|
| /users        | POST          | creates a new user| phone, password, school |
| /users/login      | POST      |   Creates JWT for user and sends as response | phone, password |
| /users/addEmail/:user_id | POST      |    adds email to user's profile| email |
| /users/wantsReceipts/:user_id | POST      |    toggles user's receipt preference| wantsReceipts |
| /users/wantsConfirmation/:user_id | POST      |    toggles user's order confirmation preference| wantsConfirmation |
| /users/hasSeenTutorial/:user_id | POST    |  marks if user has seen app tutorial| hasSeenTutorial |
| /users/:user_id | GET      |    returns user's profile        | |

**Order**:

| URL           | HTTP Request  | Description  | Request Requirements  | 
| ------------- |:-------------:|:------------:| ------------:|
| /orders/:user_id/:address_id        | POST | creates new order |cheese, pepperoni, price, cardUsed|
| /rateOrder/:user_id      | POST      |creates new order review|   stars, review |


**Card ("payment")**:

| URL           | HTTP Request  | Description  | Request Requirements  | 
| ------------- |:-------------:|:------------:| ------------:|
| /payments/newStripeUser/:user_id       | POST | creates a new Stripe profile for indicated user |stripeToken, lastFour|
| /payments/newStripeCard/:user_id      | POST      |adds new credit card to user's Stripe profile|  stripeToken, lastFour |
| /payments/updateDefaultCard/:user_id       | POST | updates user's default Stripe credit card|cardID|
| /payments/removeCard/:user_id       | POST | removes credit card from user's Stripe profile |cardID|
| /payments/charge/:user_id      | POST | charges user's Stripe profile |chargeAmount, chargeDescription, stripeToken|


**Address**:

| URL           | HTTP Request  | Description  | Request Requirements  | 
| ------------- |:-------------:|:------------:| ------------:|
| /address/:user_id       | POST | add a new address to user's profile |school, dorm, room|
| /address/dorms/:user_id       | GET | returns list of dorms for user's school||
| /address/:user_id/:address_id     | DELETE      | deletes address from user's profile | |



**Misc**:

| URL           | HTTP Request  | Description  | Request Requirements  | 
| ------------- |:-------------:|:------------:| ------------:|
| /sendCode       | POST | texts a verification code to user's indicated phone number|phone|
| /sendPassCode       | POST | texts a verification code for a user resetting their password|phone|
| /resetPass     | POST      | changes user's password if verification code matches|phone, code, password|
| /isOpen/:user_id     | GET      | returns JSON indicating whether DoorSlice is open or closed | |
| /sendOpenText     | POST      | triggers a text to users when delivery is open | |
| /prices     | GET     | returns JSON with cheese and pepperoni prices | |
