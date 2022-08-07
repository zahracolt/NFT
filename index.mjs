import {loadStdlib} from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib(process.env);

const startingBalance = stdlib.parseCurrency(1000);

console.log(`Creating a Test account for the Raffle draw.`)
const accHost = await stdlib.newTestAccount(startingBalance);

console.log(`The Creator is creating the DaVinci, DVC...`);
console.log('Loading...');
const theNFT = await stdlib.launchToken(accHost, "DaVinci", "DVC", { supply: 1})
const nftId = theNFT.id;
const numTickets = 6;
const nftParams = { nftId, numTickets };

let winningNum = 0;
let winner = [];

let done = false;
const rafflers = [];
const startRafflers = async() => {
  const runRaffler = async(who) => { // run the raffler function
    const ticket = (Math.floor(Math.random() * numTickets) + 1);

    const acc = await stdlib.newTestAccount(startingBalance); // create a new test account
    acc.setDebugLabel(who); // set the debug label 
    await acc.tokenAccept(nftId); // accept the NFT from the creator
    rafflers.push([who, ticket, acc]);
    const ctc = acc.contract(backend, ctcHost.getInfo()); // create a contract instance for the account
    const getBalance = async () => stdlib.formatCurrency(await stdlib.balanceOf(acc)); // get the balance
 
    const raffleNumber  = await ctc.apis.Raffler.showRaffle(ticket); // bid the NFT
    if ( raffleNumber == ticket ) { 
    console.log(`${who} picked ${raffleNumber}.`);
    } else {
      console.log(`${who} picked wrongly.`)
    }

    if (raffleNumber == winningNum) { // if the raffler picked the winning number
      winner.push(who); // set the winner
    };


  };
  await runRaffler('Alice');
  await runRaffler('Bob');
  await runRaffler('Tyron');
  await runRaffler('Viv');
  await runRaffler('Lyon');
  await runRaffler('Iggy');
  while (!done) {
    await stdlib.wait(0);
  }
};

const ctcHost = accHost.contract(backend);
await ctcHost.participants.Host({
      // implement Host's interact object here
  ...stdlib.hasRandom,
  getRaffle: () => { // get the raffle number
    console.log(`The Raffle information is being sent to the Backend contract: `, nftParams);
    return nftParams;
  },
  ready: () => {
    console.log('Creator is ready to accept users into the NFT Raffle draw');
    startRafflers();
  },
  getNum: (numTickets) => {
    const num = (Math.floor(Math.random() * numTickets) + 1);
    console.log(`The Raffle draw number of tickets are ${numTickets}`);
    winningNum = num;
    return num;
  },
  seeHash: (value) => {
    console.log(`The winning number HASH : ${value}`);
  },
  seeTicket: async (who, num) => { // get the ticket info
    if (num == winningNum) { // if the raffler picked the winning number
      console.log(`The winning number is ${winningNum}`);
      console.log(`Congratulations ${winner[0]}!!!`);
      console.log(`The Creator saw that ${winner[0]} picked ${num}.`);
      console.log(`${winner[0]} with the address ${stdlib.formatAddress(who)} won the NFT raffle draw!`);
      console.log(`${winner[0]} balance is 1 DVC.`); // log the balance
      process.exit(0);
      // for ( const [who, acc] of rafflers ) { // for each raffler
      //   const [ amt, amtNFT ] = await stdlib.balancesOf(acc, [null, nftId]); // get the balance
      //   console.log(`${who} has ${stdlib.formatCurrency(amt)} ${stdlib.standardUnit} and ${amtNFT} of the NFT.`); // log the balance
      // }
    };
      // console.log(`The winning number is ${winningNum}`);
      // console.log(`No one picked the winning number.`);
  },
  seeOutcome: (winner, num) => {
    console.log(`Creator saw that ${winner} won as he picked the ticket number ${num}`);
    console.log('Goodbye!');
  },
});

done = true;
