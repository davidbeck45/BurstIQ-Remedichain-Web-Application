/* eslint-disable @typescript-eslint/camelcase */




//Imports that were used in old version of file

/*
 *import {Asset} from "../http/burstchain-interfaces";
 *import { BurstChainSDK } from '../http/burst-server-endpoints';
 *import { medicationsDictionary, userDictionary } from '../hello-world/dictionary-formats';
 *import { callbackify } from "util";
 *import { parse } from "querystring";
 *
 *(//)rename console.log() to cb() for faster typing and to set up the black box on the test UI
 *const log = (line) => console.log(line)
 */



//////////////
//USER LOGIN//
//////////////

export async function loginRequest(username: string, password: string){
  localStorage.setItem("email", username);
  
  //Login request to API, no longer needs chainClient
  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: `{"username": "${username}", "password": "${password}"}`
  };

  //Gets API response
  fetch('https://testnet.burstiq.com/api/userauth/login', reqSpec)
  .then(resp => resp.json())
  .then(data => {putTokenInLocalStorage(data)
    console.log(data)})
  
}



//Take in response and store the JWT token in localstorage
function putTokenInLocalStorage(data){
  localStorage.setItem("token", data.token)
}







////////////////////////////
//Donation Form Submission//
////////////////////////////

//create an asset on the medications blockchain, called when the donation form is filled out
export async function addDonation (drug_name, dose, quantity){
  
  //donor public ID is hard-coded
  let publicIdUser = "a33a569382be82588775ba9dcce2522399039c19" 

  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
    body: `{"owners": ["${publicIdUser}"], "asset": {"drug_name": "${drug_name}", "dose": "${dose}", "quantity": "${quantity}", "status": "Pending"}}`
  };

  //Gets API response
  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications/asset', reqSpec)
  .then(resp => resp.json())
  .then(data => {transferToInventory(data.asset_id)
  console.log(data)})

}




//transfer ownership of a drug from a donor to the inventory
export async function transferToInventory (assetId) {
  
  localStorage.setItem("newAssetId", assetId)
  
  //Hard-coded values
  let publicIdInventory = "b3155808a4067004115271b53a1313ab419f4a64"
  let publicIdUser = "a33a569382be82588775ba9dcce2522399039c19"

  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    },
    body: `{"asset_id": "${assetId}","new_owners": ["${publicIdInventory}"],"new_signer_public_id": "${publicIdInventory}","owners": ["${publicIdUser}"]}`
  };

  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications/transfer', reqSpec)
  .then(resp => resp.json())
  .then(data => console.log(data))

}







/////////////////////////////////////////////////////////////
//Demo Functionality for Pharmacist to Approve a Medication//
/////////////////////////////////////////////////////////////


export function pharmacistMedicationApproval(){
  //get newly created asset from localStorage for demo
  let assetId = localStorage.getItem("newAssetId")
  
  //set inventory private ID
  const privateIdInventory = 'c50188204aecb09d';

  queryByAssetId(assetId, privateIdInventory)
}





//query Medications with a specfic asset ID
function queryByAssetId(assetId, privateIdInventory){
  
  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `ID ${privateIdInventory}`
    },
    body: `{"queryTql": "SELECT * FROM Medications WHERE asset_id = '${assetId}'"}`
  };

  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications/assets/query', reqSpec)
  .then(resp => resp.json()) 
  .then(data => {updateMedicationStatus(data, privateIdInventory)
    console.log(data)})

}


async function updateMedicationStatus(response, privateIdInventory){
  let userAsset = response.assets[0].asset
  let assetId = response.assets[0].asset_id

  userAsset.status = "Approved"

  const reqSpec = {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `ID ${privateIdInventory}`
    },
    body: `{"asset": ${JSON.stringify(userAsset)}, "asset_id": "${assetId}"}`
  };
  
  console.log(reqSpec.body)
  //Gets API response
  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications/asset', reqSpec)
  .then(resp => resp.json())
  .then(data => console.log(data))
}







/////////////////////////
//Display the Inventory//
/////////////////////////


//query for the array of medications in inventory matching the specified status
export async function queryForInventory(status){
  
  //set inventory private ID
  const privateIdInventory = 'c50188204aecb09d';
  
  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `ID ${privateIdInventory}`
    },
    body: `{"queryTql": "SELECT * FROM Medications WHERE asset.status = '${status}'"}`
  };

  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications/assets/query', reqSpec)
  .then(resp => resp.json())
  .then(data => {displayInventory(data.assets)
    console.log(data)})
  
}




function displayInventory(inventory){
  let arrOfInventory = Array.from(Array(inventory.length), () => new Array(3));
  for (let i = 0; i < inventory.length; i++) {

    arrOfInventory[i][0] = inventory[i].asset.drug_name;
    arrOfInventory[i][1] = inventory[i].asset.dose;
    arrOfInventory[i][2] = inventory[i].asset.quantity;

    //Temporary soln, print each asset to console
    console.log(arrOfInventory[i])
  }

  //TODO return may not work, so may want to rewire this to just create the html straight up
  
  //returns a 2D JS array, where each row is a med, and each column is a name/dose/quantity in that order
  return arrOfInventory
}





//transfer ownership of a drug from the inventory to a recipient - in this case the same user as the donor
export async function transferfromInventory (assetId) {
  
  //Hard-coded values
  let privateIdInventory = "c50188204aecb09d"
  let publicIdInventory = "b3155808a4067004115271b53a1313ab419f4a64"
  let publicIdUser = "a33a569382be82588775ba9dcce2522399039c19"

  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `ID ${privateIdInventory}`
    },
    body: `{"asset_id": "${assetId}","new_owners": ["${publicIdUser}"],"new_signer_public_id": "${publicIdUser}","owners": ["${publicIdInventory}"]}`
  };

  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications/transfer', reqSpec)
  .then(resp => resp.json())
  .then(data => console.log(data))
}







/////////////////////////////
//Prescription Request Form//
/////////////////////////////


//adds a prescription to a user's data on the user blockchain after they fill out a presciption request form
export async function addUserPrescription(inputValues: string[]){
  //TODO move this constructor up a level to be created within the HTML file where the inputValues array exists
  const prescription = {
    patient_contact: {
      name: inputValues[0],
      address: inputValues[1], 
      phone: inputValues[2], 
      email: inputValues[3] 
    },
    patient_info: {
      household_size: inputValues[4],
      household_annual_income: inputValues[5],
      insurance_status: inputValues[6],
      date_of_birth: inputValues[7],
      allergies: inputValues[8]
    },
    prescriber_contact: {
      name: inputValues[9],
      address: inputValues[10],
      phone: inputValues[11],
      email: inputValues[12]
    },
    primary_contact: {
      name: inputValues[13],
      phone: inputValues[14],
      email: inputValues[15]
    },
    prescription_info: {
      drug_name: inputValues[16],
      dose_strength: inputValues[17],
      dosing_schedule: inputValues[18],
      diagnosis: inputValues[19]
    },
    follow_up_contact: {
      name: inputValues[20],
      phone: inputValues[21],
      email: inputValues[22],
      organization: inputValues[23]
    },
    status: "Pending"
  };

  //set inventory private ID
  const privateIdInventory = 'c50188204aecb09d';

  await queryByUserEmail(privateIdInventory, prescription)
}





//Check RemedichainUsers dictionary for the user asset based off of the email of the current user logged in
async function queryByUserEmail(privateIdInventory, prescription){
  const reqSpec = {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `ID ${privateIdInventory}`
    },
    body: `{"queryTql": "SELECT * FROM RemedichainUsers WHERE asset.user_email = 'johndoenor@gmail.com'"}`
  };

  
  await fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/RemedichainUsers/assets/query', reqSpec)
  .then(resp => resp.json()) 
  .then(data => {updateUserPrescriptions(data, privateIdInventory, prescription)
    console.log(data)})
}



async function updateUserPrescriptions(response, privateIdInventory, prescription){
  let userAsset = response.assets[0].asset
  let assetId = response.assets[0].asset_id
  
  userAsset.prescriptions.push(prescription)

  const reqSpec = {
    method: 'PUT',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `ID ${privateIdInventory}`
    },
    body: `{"asset": ${JSON.stringify(userAsset)}, "asset_id": "${assetId}"}`
  };
  
  //Gets API response
  fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/RemedichainUsers/asset', reqSpec)
  .then(resp => resp.json())
  .then(data => console.log(data))
}