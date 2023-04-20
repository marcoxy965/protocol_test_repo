import * as LitJsSdkNodeJs from "@lit-protocol/lit-node-client-nodejs";

/**
 * Some interesting parameters in the old sdk - alertWhenUnauthorized, debug
 * const litNodeClient = new LitJsSdk.LitNodeClient({
    alertWhenUnauthorized: false,
    litNetwork: "serrano",
    debug: true,
  });
 */

// this code will be run on the node
const litActionCode = `
const go = async () => {  
  const url = "https://api.weather.gov/gridpoints/TOP/31,80/forecast";
  const resp = await fetch(url).then((response) => response.json());
  const temp = resp.properties.periods[0].temperature;

  // only sign if the temperature is above 60.  if it's below 60, exit.
  if (temp < 60) {
    return;
  }
  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (toSign, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey , sigName });
};

go();
`;

// you need an AuthSig to auth with the nodes
// normally you would obtain an AuthSig by calling LitJsSdk.checkAndSignAuthMessage({chain})
const authSig = {
    sig: '0xeb271a2a695b7bc3655c89919ba45469ed006ab48f2669cf30ac16c16e4f72b2502aa1d6b49b9679a7ce2e6417183172b944f5e915a5a0034a045abcb4740e5a1c',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: 'localhost:1210 wants you to sign in with your Ethereum account:\n' +
        '0xeE52f6E8F8F075Bb6119958c1ACeB16C788e57d6\n' +
        '\n' +
        '\n' +
        'URI: http://localhost:1210/auth\n' +
        'Version: 1\n' +
        'Chain ID: 1\n' +
        'Nonce: 4L08882G7gyr5UNAo\n' +
        'Issued At: 2023-04-19T23:41:46.774Z\n' +
        'Expiration Time: 2023-04-20T23:41:46.759Z',
    address: '0xee52f6e8f8f075bb6119958c1aceb16c788e57d6'
};

const runLitAction = async () => {
    const litNodeClient = new LitJsSdkNodeJs.LitNodeClientNodeJs({
        litNetwork: "serrano",
    });
    await litNodeClient.connect();
    const signatures = await litNodeClient.executeJs({
        targetNodeRange: 1,
        code: litActionCode,
        authSig,
        // all jsParams can be used anywhere in your litActionCode
        jsParams: {
            // this is the string "Hello World" for testing
            toSign: [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100],
            publicKey:
                "0x044f9cbd78601c7ef5e4f95f43ddd3ad100782f2a5bec51032128af4a226f82b57342bea3371be09d3f88c7b26d954cf38e9bfca41d4399038d77174f6e809e07f",
            sigName: "sig1",
        },
    });
    console.log("signatures: ", signatures);
};

runLitAction();