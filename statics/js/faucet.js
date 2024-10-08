'use strict';

const shimmerevm = {
    chainName: 'Supernova',
    chainId: 73405,
    rpcUrl: 'https://rpc.novascan.io',
    blockExplorerUrl: 'https://novascan.io',
    currency: 'xZNN',
    decimal: 18
}

$('#btn-faucet').click(async function (e) {
    e.preventDefault();
    let address = $('#address').val();
    let token = $( "#token option:selected" ).text().toString();
    let addressValidated = await validateAddress(address);
    if (addressValidated === true) {
        $('#faucet-msg').html(alertContent.loading);
        await requestFunds(token, address);
    } else {
        // console.log('Invalid Address!');
        $('#faucet-msg').html(alertContent.errorInvalid);
    }
});

$('#btn-token').click(async function(e) {
    e.preventDefault();
    let token = $( "#token option:selected" ).text().toString();
    // console.log('token:', token);
    // Get Token Data
    let tokenData = await getTokenInfo(token);

    try {
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenData.address,
                    symbol: tokenData.symbol,
                    decimals: tokenData.decimals,
                    image: tokenData.image,
                },
            },
        });

        if (wasAdded) {
            console.log('Thanks for your interest!');
        } else {
            console.log('Your loss!');
        }
    } catch (error) {
        console.log(error);
    }
});

$('#btn-evm').click(async function(e) {
    e.preventDefault();
    console.log('Adding Supernova to Metamask...');
    let hexParsedChainId = parseChainId(shimmerevm.chainId);

    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainName: shimmerevm.chainName,
                    chainId: hexParsedChainId,
                    nativeCurrency: {
                        name: shimmerevm.currency,
                        decimals: shimmerevm.decimal,
                        symbol: shimmerevm.currency
                    },
                    rpcUrls: [shimmerevm.rpcUrl],
                    blockExplorerUrls: [shimmerevm.blockExplorerUrl]
                }
            ]
        });
    } catch (error) {
        console.log(error);
    }
});

// Validate evm address
async function validateAddress(address) {
    try {
        let addressResponse = ethers.utils.getAddress(address);
        console.log('addressResponse:', addressResponse);
    } catch (error) {
        console.log('error:', error);
        return false;
    }
    return true;
}

async function requestFunds(token, address) {
    console.log('\nRequesting', token, 'for', address);
    let apiResponse = await axios.post('/fund', {
        token: token,
        address: address
    });
    // console.log('apiResponse:', apiResponse);
    $('#faucet-msg').html(alertContent.success);
}

function parseChainId(chainId) {
    let hexChainId = ethers.utils.hexlify(chainId);
    // Trim any leading 0s
    return '0x' + hexChainId.split('0x')[1].replace(/^0+/, '');
}

async function getTokenInfo(tokenName) {
    let apiResponse = await axios.get('/token', {
        params: {
            key: tokenName
        }
    });
    return apiResponse.data
}

$('#token').change(async function(){
    let token = $(this).val();
    let tokenData = await getTokenInfo(token);
    $('#token-name').html(token);
    $('#token-address').html(tokenData.address);
});
