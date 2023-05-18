"use strict";
/* eslint-disable @typescript-eslint/camelcase */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.addUserPrescription = exports.transferFromInventory = exports.queryForInventory = exports.pharmacistMedicationApproval = exports.transferToInventory = exports.addDonation = void 0;



//////////////
//USER LOGIN//
//////////////

//enter a username and password to collect a JWT token and place it in local storage
function loginRequest(username, password) {
    var reqSpec = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                username: username,
                password: password
            }
        )
    };
    //Gets API response
    var loggedIn = false;
    fetch('https://testnet.burstiq.com/api/userauth/login', reqSpec)
        .then(function (resp) { return resp.json(); })
        .then(function (data) {
        putTokenInLocalStorage(data);
            console.log(data);
            if (data.status == 200) {
                loggedIn = true;
                location.assign("./account.html");
                localStorage.setItem("publicIdUser", data.userData.publicId);
                localStorage.setItem("email", username);
                localStorage.setItem("publicIdAdmin", "a14cff6edf276f4892d02d830f95d2631a845f2e");
                localStorage.setItem("privateIdAdmin", "89ffdd2a6c099939")
                for(let i = 0; i < data.userData.roles.length; i ++){
                    if(data.userData.roles[i] == "PHARMA"){
                        location.assign("./pharmacist_portal.html");
                    }
                }
            }
            else {
                alert("Sorry, you have entered the wrong username or password. Please try again.")
            }
        })
        .then(function () {
            queryByUserEmail();
    });
    return [2 /*return*/];
}
exports.loginRequest = loginRequest;


//take in response and store the JWT token in localstorage
function putTokenInLocalStorage(data) {
    localStorage.setItem("token", data.token);
}

////////////////////////////
//Donation Form Submission//
////////////////////////////

//create an asset on the Medications2 blockchain, called when the donation form is filled out
function addDonation(drug_name, dosage, quantity, expirationDate, ndc, drugForm, manufacturer, lot, monetaryVal, dosageUnit) {
    var reqSpec = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        },

        body: JSON.stringify(
            {
                owners: [localStorage.getItem("publicIdAdmin"), localStorage.getItem("publicIdUser")],
                asset:
                {
                    drug_name: drug_name,
                    dosage: dosage,
                    quantity: quantity,
                    expiration_date: expirationDate,
                    NDC: ndc,
                    form: drugForm,
                    manufacturer: manufacturer,
                    lot: lot,
                    monetary_value: monetaryVal,
                    status: "Pending",
                    dosage_unit: dosageUnit,
                    donor_id: "donor_id",
                    recipient_id: "recipient_id"
                }
            }
        )

        // body: "{\"owners\": [\"" + publicIdAdmin + "\"], \"asset\": {\"drug_name\": \"" + drug_name + "\", \"dose\": \"" + dose + "\", \"quantity\": \"" + quantity + "\", \"status\": \"Pending\"}}"
    };
    console.log(reqSpec.body);
    //gets API response
    fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications2/asset', reqSpec)
        .then(function (resp) { return resp.json(); })
        .then(function (data) {
            localStorage.setItem("newAssetId", data.asset_id);
            // transferToInventory(data.asset_id);
            console.log(data);
            //revisit because in the future the donor will not be a co-owner
            transferToInventory();
            alert("Thank you for your donation! Remedichain will contact you shortly with shipping information."); //Popup that displays a thank you message
            // location.assign("./account.html"); //Reroutes to the home page
        })
        .then(function (){

            // pharmacistMedicationApproval();
            // location.assign("./account.html");
        });
    return [2 /*return*/];
}
exports.addDonation = addDonation;


//transfer ownership of a drug from a donor to the inventory with a pending status
function transferToInventory() {
    var reqSpec = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(
            {
                asset_id: localStorage.getItem("newAssetId"),
                new_owners: [localStorage.getItem("publicIdAdmin")],
                new_signer_public_id: localStorage.getItem("publicIdAdmin"),
                owners: [localStorage.getItem("publicIdAdmin"), localStorage.getItem("publicIdUser")]
            }
        )
        // "{\"asset_id\": \"" + assetId + "\",\"new_owners\": [\"" + publicIdInventory + "\"],\"new_signer_public_id\": \"" + publicIdInventory + "\",\"owners\": [\"" + publicIdUser + "\"]}"
    };
        fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications2/transfer', reqSpec)
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
                console.log("1");
                // pharmacistMedicationApproval();
                console.log(data);
            }).catch(err => console.log(err));
    return [2 /*return*/];
}
exports.transferToInventory = transferToInventory;


/////////////////////////////////////////////////////////////
//Demo Functionality for Pharmacist to Approve a Medication//
/////////////////////////////////////////////////////////////

// function pharmacistMedicationApproval() {
//     //get newly created asset from localStorage for demo
//     var assetId = localStorage.getItem("newAssetId");
//     //set inventory private ID
//     queryByAssetId(assetId);
// }
// exports.pharmacistMedicationApproval = pharmacistMedicationApproval;


//query Medications2 with a specfic asset ID
function queryByAssetId(assetId) {
    console.log(assetId);
    var reqSpec = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "ID " + localStorage.getItem("privateIdAdmin")
        },
        body: JSON.stringify(
            {
                queryTql: "SELECT * FROM Medications2 WHERE asset_id = '" + assetId + "'"
            }
        )
        // body: "{\"queryTql\": \"SELECT * FROM Medications2 WHERE asset_id = '" + assetId + "'\"}"
    };
    console.log(reqSpec.body);
    fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications2/assets/query', reqSpec)
        .then(function (resp) { return resp.json(); })
        .then(function (data) {
            updateMedicationStatus(data);
            console.log(data.assets);
            transferToInventory();
    }).catch(err => console.log(err));
    return [2 /*return*/];
}


//update the asset from Pending status to Approved status
function updateMedicationStatus(response) {
      var userAsset, assetId, reqSpec;
      userAsset = response.assets[0].asset;
      assetId = response.assets[0].asset_id;

      console.log("Asset: " + assetId);

      userAsset.status = "Approved";
      reqSpec = {
          method: 'PUT',
          headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': "ID " + localStorage.getItem("privateIdAdmin")
          },

          body: JSON.stringify(
              {
                  asset: userAsset,
                  asset_id: assetId
              }
          )
      };
      console.log(reqSpec.body);
      //Gets API response
      fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications2/asset', reqSpec)
          .then(function (resp) { return resp.json(); })
          .then(function (data) { return console.log(data); })
          .then(function () { location.assign("./account.html"); });
      return [2 /*return*/];
}


/////////////////////////
//Display the Inventory//
/////////////////////////

//query for the array of Medications2 in inventory matching the specified status
function queryForInventory(status) {
        var reqSpec;
        //privateIdInventory = 'c50188204aecb09d';
        reqSpec = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': "ID 89ffdd2a6c099939"
            },

            body: JSON.stringify(
                {
                    queryTql: "SELECT * FROM Medications2 WHERE asset.status = '" + status + "'"
                }
            )
        };
        fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications2/assets/query', reqSpec)
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
            displayInventory(data.assets);
            console.log(data);
        });
        return [2 /*return*/];

}
exports.queryForInventory = queryForInventory;

//takes asset data to display the inventory as a table on the web page
function displayInventory(inventory) {
    var arrOfInventory = Array.from(Array(inventory.length), function () { return new Array(6); });
    for (var i = 0; i < inventory.length; i++) {
        arrOfInventory[i][0] = inventory[i].asset.drug_name;
        arrOfInventory[i][1] = inventory[i].asset.dosage;
        arrOfInventory[i][2] = inventory[i].asset.quantity;
        arrOfInventory[i][3] = inventory[i].asset_id;
        arrOfInventory[i][4] = inventory[i].asset.dosage_unit;
        arrOfInventory[i][5] = inventory[i].asset.status;
        //Temporary soln, print each asset to console
        console.log(arrOfInventory[i]);
    }

    //HTML code to show the table
    var table = document.getElementById('myTable')

    for (var i = 0; i < arrOfInventory.length; i++) {
        var row = `<tr>
                        <td class="drugName">${arrOfInventory[i][0]}</td>
                        <td class="drugDosage">${arrOfInventory[i][1] + " " + arrOfInventory[i][4]}</td>
                        <td class="drugQty">${arrOfInventory[i][2]}</td>
                        <td class="statusSelect">
                        <select class="form-control form-control-sm" id="selector${i}">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Unusable">Unusable</option>
                        </select>
                        </td>
                        <td>
                            <!--Save Status Button-->
                            <button onclick="transferFromInventory" class="morebtn btn btn-primary">
                                Save  Status
                            </button>
                        </td>
                    </tr>`
        table.innerHTML += row;
    }

    for (var i = 0; i < arrOfInventory.length; i++) {
        defaultStatusSelection(i, arrOfInventory[i][5]);
    }
    localStorage.setItem("inventoryArray", arrOfInventory)
}
/////////////////////////////////
//Transfer Assets To Recipients//
/////////////////////////////////

//transfer ownership of an asset from the inventory to a recipient - in this case the same user as the donor
function transferFromInventory(assetId) {
        var reqSpec = {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': "ID " + localStorage.getItem("privateIdAdmin")
            },
            body: JSON.stringify(
                {
                    asset_id: assetId,
                    new_owners: [localStorage.getItem("publicIdUser")],
                    new_signer_public_id: localStorage.getItem("publicIdUser"),
                    owners: [localStorage.getItem("publicIdAdmin")]
                }
            )
        };
        fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Medications2/transfer', reqSpec)
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
                alert("Enjoy the meds!");
                return console.log(data);
            })
            .then(() => window.location.reload());
        return [2 /*return*/];
}
exports.transferFromInventory = transferFromInventory;


/////////////////////////////
//Prescription Request Form//
/////////////////////////////

//adds a prescription to a user's data on the user blockchain after they fill out a presciption request form
function addUserPrescription(inputValues) {
    console.log(inputValues);
    var doses = inputValues[31].split("\n")
    var days = inputValues[32].split("\n")
    var times = inputValues[33].split("\n")
    var dosing = []
    for (let i = 0; i < doses.length; i++) {
        dosing.push(
            {
                dose: doses[i],
                day_of_week: days[i],
                time_of_day: times[i]
            }
        )
    }
    var prescription = {
        patient_contact: {
            first_name: inputValues[0],
            last_name: inputValues[1],
            phone: inputValues[2],
            email: inputValues[3],
            address: {
                street: inputValues[4],
                city: inputValues[5],
                state: inputValues[6],
                country_code: inputValues[7],
                zip_code: inputValues[8],
                apartment_number: inputValues[9]
            }

        },
        patient_info: {
            household_size: inputValues[10],
            household_annual_income: inputValues[11],
            insurance_status: inputValues[12],
            date_of_birth: inputValues[13],
            allergies: inputValues[14].split("\n")
        },
        prescriber_contact: {
            first_name: inputValues[15],
            last_name: inputValues[16],
            address: {
                street: inputValues[17],
                city: inputValues[18],
                state: inputValues[19],
                country_code: inputValues[20],
                zip_code: inputValues[21],
                apartment_number: inputValues[22]
            },
            phone: inputValues[23],
            email: inputValues[24]
        },
        primary_contact: {
            first_name: inputValues[25],
            last_name: inputValues[26],
            phone: inputValues[27],
            email: inputValues[28]
        },
        prescription_info: {
            drug_name: inputValues[29],
            dosage: inputValues[30],
            dosing_schedule: dosing,
            dosage_unit: inputValues[34]
        },
        follow_up_contact: {
            first_name: inputValues[35],
            last_name: inputValues[36],
            email: inputValues[37],
            phone: inputValues[38],
            organization: inputValues[39]
        },
        status: "Pending",
        public_id: localStorage.getItem("userId")
    };
    return [4 /*yield*/, updateUserPrescriptions(prescription)];
}

exports.addUserPrescription = addUserPrescription;

//Check RemedichainUsers dictionary for the user asset based off of the email of the current user logged in
function queryByUserEmail() {
    var reqSpec = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(
            {
                queryTql: "SELECT * FROM RemedichainUsers2 WHERE asset.email = '" + localStorage.getItem("email") + "'"
            }
        )
    };
    return [4 /*yield*/, fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/RemedichainUsers2/assets/query', reqSpec)
            .then(function (resp) { return resp.json(); })
            .then(function (data) {
                prescription.public_id = data.assets[0].asset.public_id;
                localStorage.setItem("userId", data.assets[0].asset.public_id);
        })];
}

//update the user prescriptions array on the chain of user data
function updateUserPrescriptions(prescription) {
    var reqSpec = {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify(
            {
                owners: [localStorage.getItem("publicId"), localStorage.getItem("publicIdAdmin")],
                asset: prescription
            }
        )
    };
    console.log(reqSpec.body);
    //Gets API response
    fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Prescriptions/asset', reqSpec)
        .then(function (resp) { return resp.json(); })
        .then(function (data) {
            alert("Your prescription request has been recieved. Remedichain will be in contact with you shortly!"); //Popup that displays a thank you message
            location.assign("./account.html"); //Reroutes to the home page
        });
    return [2 /*return*/];
}

function queryRequests(status) {
    var reqSpec;

     reqSpec = {
         method: 'POST',
         headers: {
             'accept': 'application/json',
             'Content-Type': 'application/json',
             'Authorization': "ID 89ffdd2a6c099939" // TODO: FIGURE THIS OUT
         },

         body: JSON.stringify(
             {
                 queryTql: "SELECT * FROM Prescriptions WHERE status = " + status + " ORDER BY timestamp"
             }
         )
     };
     fetch('https://testnet.burstiq.com/api/burstchain/mines_summer/Prescriptions/assets/query', reqSpec)
         .then(function (resp) { return resp.json(); })
         .then(function (data) {
         displayActiveRequests(data.assets);
         console.log(data);
     });
     return [2 /*return*/];
}

function displayActiveRequests(prescriptions) {
    var arrOfInventory = Array.from(Array(prescriptions.length), function () { return new Array(6); });
    for (var i = 0; i < prescriptions.length; i++) {
        arrOfInventory[i][0] = prescriptions[i].asset.patient_contact.first_name;
        arrOfInventory[i][1] = prescriptions[i].asset.patient_contact.last_name;
        arrOfInventory[i][2] = convertDateObject(prescriptions[i].timestamp.$date);
        arrOfInventory[i][3] = prescriptions[i].asset.prescription_info.drug_name;
        arrOfInventory[i][4] = prescriptions[i].asset.prescription_info.dosage;
        arrOfInventory[i][5] = prescriptions[i].asset.prescription_info.dosing_schedule.dosage_unit;
    }

    // Get the initially empty accordion element
    var requestsAccordion = document.getElementById('requestsAccordion')

    for (var i = 0; i < arrOfInventory.length; i++) {
        var entry = `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="heading${i}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">${arrOfInventory[i][0]} ${arrOfInventory[i][1]}</button>
                    </h2>
                    
                    <div id="collapse${i}" class="accordion-collapse collapse show" aria-labelledby="heading${i}" data-bs-parent="#requestsAccordion">
                        <div class="accordion-body">
                            <div class="container">
                                <div class="row">
                                    <div class="col">
                                        <div class="row"> Request Date: ${arrOfInventory[i][2]} </div>
                                        <div class="row"> Requested Quantity: 0 </div>
                                    </div>
                                    <div class="col">
                                        <div class="row"> Requested Medication: ${arrOfInventory[i][3]} </div>
                                        <div class="row"> Dosage: ${arrOfInventory[i][4]} mg </div>
                                    </div>
                                    <div class="col-4">
                                        <div class="row">
                                        <button type="button" class="btn btn-primary" onclick="window.location.href='assigning_medications.html';">Assign Medications</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `
        requestsAccordion.innerHTML += entry
    }
}

function convertDateObject(date) {
    return (date.substr(11,5) + " " +
            date.substr(5,5) + "-" +
            date.substr(0,4));
}

function defaultStatusSelection(selectorID, status) {
    const currentSelector = "selector" + selectorID.toString();
    const $select = document.getElementById(currentSelector);
    const $options = Array.from($select.options);
    const optionToSelect = $options.find(item => item.text===status)
    $select.value = optionToSelect.value;
}