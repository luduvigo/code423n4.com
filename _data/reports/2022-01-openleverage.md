---
sponsor: "OpenLeverage"
slug: "2022-01-openleverage"
date: "2022-03-09"
title: "OpenLeverage contest"
findings: "https://github.com/code-423n4/2022-01-openleverage-findings/issues"
contest: 72
---

# Overview

## About C4

Code4rena (C4) is an open organization consisting of security researchers, auditors, developers, and individuals with domain expertise in smart contracts.

A C4 code contest is an event in which community participants, referred to as Wardens, review, audit, or analyze smart contract logic in exchange for a bounty provided by sponsoring projects.

During the code contest outlined in this document, C4 conducted an analysis of the OpenLeverage smart contract system written in Solidity. The code contest took place between January 27—February 2 2022.

## Wardens

31 Wardens contributed reports to the OpenLeverage contest:

  1. hyh
  1. [defsec](https://twitter.com/defsec_)
  1. [gzeon](https://twitter.com/gzeon)
  1. WatchPug ([jtp](https://github.com/jack-the-pug) and [ming](https://github.com/mingwatch))
  1. robee
  1. mics
  1. [csanuragjain](https://twitter.com/csanuragjain)
  1. [Dravee](https://twitter.com/JustDravee)
  1. [pauliax](https://twitter.com/SolidityDev)
  1. jayjonah8
  1. [cmichel](https://twitter.com/cmichelio)
  1. [jonah1005](https://twitter.com/jonah1005w)
  1. [rfa](https://www.instagram.com/riyan_rfa/)
  1. samruna
  1. [sirhashalot](https://twitter.com/SirH4shalot)
  1. cccz
  1. 0x1f8b
  1. 0x0x0x
  1. [tqts](https://tqts.ar/)
  1. [Tomio](https://twitter.com/meidhiwirara)
  1. [throttle](https://twitter.com/_no_handlebars)
  1. [0v3rf10w](https://twitter.com/_0v3rf10w)
  1. [Ruhum](https://twitter.com/0xruhum)
  1. p4st13r4 ([0x69e8](https://github.com/0x69e8) and 0xb4bb4)
  1. [Fitraldys](https://twitter.com/fitraldys)
  1. m_smirnova2020
  1. IllIllI
  1. GeekyLumberjack
  1. [wuwe1](https://twitter.com/wuwe19)

This contest was judged by [0xleastwood](https://twitter.com/liam_eastwood13).

Final report assembled by [liveactionllama](https://twitter.com/liveactionllama) and [CloudEllie](https://twitter.com/CloudEllie1).

# Summary

The C4 analysis yielded an aggregated total of 21 unique vulnerabilities and 83 total findings. All of the issues presented here are linked back to their original finding.

Of these vulnerabilities, 1 received a risk rating in the category of HIGH severity, 5 received a risk rating in the category of MEDIUM severity, and 15 received a risk rating in the category of LOW severity.

C4 analysis also identified 22 non-critical recommendations and 40 gas optimizations.

# Scope

The code under review can be found within the [C4 OpenLeverage contest repository](https://github.com/code-423n4/2022-01-openleverage), and is composed of 33 smart contracts written in the Solidity programming language and includes 4251 lines of Solidity code.

# Severity Criteria

C4 assesses the severity of disclosed vulnerabilities according to a methodology based on [OWASP standards](https://owasp.org/www-community/OWASP_Risk_Rating_Methodology).

Vulnerabilities are divided into three primary risk categories: high, medium, and low.

High-level considerations for vulnerabilities span the following key areas when conducting assessments:

- Malicious Input Handling
- Escalation of privileges
- Arithmetic
- Gas use

Further information regarding the severity criteria referenced throughout the submission review process, please refer to the documentation provided on [the C4 website](https://code423n4.com).

# High Risk Findings (1)
## [[H-01] OpenLevV1Lib's and LPool's `doTransferOut` functions call native `payable.transfer`, which can be unusable for smart contract calls](https://github.com/code-423n4/2022-01-openleverage-findings/issues/75)
_Submitted by hyh_

When OpenLev operations use a wrapped native token, the whole user withdraw is being handled with a `payable.transfer()` call.

This is unsafe as `transfer` has hard coded gas budget and can fail when the user is a smart contract. This way any programmatical usage of OpenLevV1 and LPool is at risk.

Whenever the user either fails to implement the payable fallback function or cumulative gas cost of the function sequence invoked on a native token transfer exceeds 2300 gas consumption limit the native tokens sent end up undelivered and the corresponding user funds return functionality will fail each time.

As OpenLevV1 `closeTrade` is affected this includes user's principal funds freeze scenario, so marking the issue as a high severity one.

#### Proof of Concept

OpenLevV1Lib and LPool have `doTransferOut` function that calls native token payable.transfer:

OpenLevV1Lib.doTransferOut

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1Lib.sol#L253>

LPool.doTransferOut

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/liquidity/LPool.sol#L297>

LPool.doTransferOut is used in LPool redeem and borrow, while OpenLevV1Lib.doTransferOut is used in OpenLevV1 trade manipulation logic:

closeTrade

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1.sol#L204>

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1.sol#L215>

liquidate

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1.sol#L263>

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1.sol#L295>

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1.sol#L304>

#### References

The issues with `transfer()` are outlined here:

<https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/>

#### Recommended Mitigation Steps

OpenLevV1's `closeTrade` and `liquidate` as well as LPool's `redeem`, `redeemUnderlying`, `borrowBehalf`, `repayBorrowBehalf`, `repayBorrowEndByOpenLev` are all `nonReentrant`, so reentrancy isn't an issue and `transfer()` can be just replaced.

Using low-level `call.value(amount)` with the corresponding result check or using the OpenZeppelin `Address.sendValue` is advised:

<https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Address.sol#L60>

**[ColaM12 (OpenLeverage) confirmed and resolved](https://github.com/code-423n4/2022-01-openleverage-findings/issues/75)**

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/75#issuecomment-1045627508):**
 > Awesome find! Completely agree with the warden here. This would prevent users from calling sensitive functions which withdraw their funds in some way. 



***

 
# Medium Risk Findings (5)
## [[M-01] `UniV2ClassDex.sol#uniClassSell()` Tokens with fee on transfer are not fully supported](https://github.com/code-423n4/2022-01-openleverage-findings/issues/208)
_Submitted by WatchPug_

<https://github.com/code-423n4/2022-01-openleverage/blob/501e8f5c7ebaf1242572712626a77a3d65bdd3ad/openleverage-contracts/contracts/dex/bsc/UniV2ClassDex.sol#L31-L56>

```solidity
function uniClassSell(DexInfo memory dexInfo,
    address buyToken,
    address sellToken,
    uint sellAmount,
    uint minBuyAmount,
    address payer,
    address payee
) internal returns (uint buyAmount){
    address pair = getUniClassPair(buyToken, sellToken, dexInfo.factory);
    IUniswapV2Pair(pair).sync();
    (uint256 token0Reserves, uint256 token1Reserves,) = IUniswapV2Pair(pair).getReserves();
    sellAmount = transferOut(IERC20(sellToken), payer, pair, sellAmount);
    uint balanceBefore = IERC20(buyToken).balanceOf(payee);
    dexInfo.fees = getPairFees(dexInfo, pair);
    if (buyToken < sellToken) {
        buyAmount = getAmountOut(sellAmount, token1Reserves, token0Reserves, dexInfo.fees);
        IUniswapV2Pair(pair).swap(buyAmount, 0, payee, "");
    } else {
        buyAmount = getAmountOut(sellAmount, token0Reserves, token1Reserves, dexInfo.fees);
        IUniswapV2Pair(pair).swap(0, buyAmount, payee, "");
    }

    require(buyAmount >= minBuyAmount, 'buy amount less than min');
    uint bought = IERC20(buyToken).balanceOf(payee).sub(balanceBefore);
    return bought;
}
```

While `uniClassBuy()` correctly checks the actually received amount by comparing the before and after the balance of the receiver, `uniClassSell()` trusted the result given by `getAmountOut()`. This makes `uniClassSell()` can result in an output amount fewer than `minBuyAmount`.

<https://github.com/code-423n4/2022-01-openleverage/blob/501e8f5c7ebaf1242572712626a77a3d65bdd3ad/openleverage-contracts/contracts/dex/bsc/UniV2ClassDex.sol#L101-L102>

#### Recommendation

Change to:

```solidity
function uniClassSell(DexInfo memory dexInfo,
    address buyToken,
    address sellToken,
    uint sellAmount,
    uint minBuyAmount,
    address payer,
    address payee
) internal returns (uint bought){
    address pair = getUniClassPair(buyToken, sellToken, dexInfo.factory);
    IUniswapV2Pair(pair).sync();
    (uint256 token0Reserves, uint256 token1Reserves,) = IUniswapV2Pair(pair).getReserves();
    sellAmount = transferOut(IERC20(sellToken), payer, pair, sellAmount);
    uint balanceBefore = IERC20(buyToken).balanceOf(payee);
    dexInfo.fees = getPairFees(dexInfo, pair);
    if (buyToken < sellToken) {
        buyAmount = getAmountOut(sellAmount, token1Reserves, token0Reserves, dexInfo.fees);
        IUniswapV2Pair(pair).swap(buyAmount, 0, payee, "");
    } else {
        buyAmount = getAmountOut(sellAmount, token0Reserves, token1Reserves, dexInfo.fees);
        IUniswapV2Pair(pair).swap(0, buyAmount, payee, "");
    }
    uint bought = IERC20(buyToken).balanceOf(payee).sub(balanceBefore);
    require(bought >= minBuyAmount, 'buy amount less than min');
}
```

**[ColaM12 (OpenLeverage) confirmed and resolved](https://github.com/code-423n4/2022-01-openleverage-findings/issues/208)**

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/208#issuecomment-1050844620):**
 > Agree with this finding! Uniswap token swaps are meant to support all types of tokens. It does seem possible for there to be `payer` to experience increased slippage because the check operates on `getAmountOut()` and not the `bought` output.
 >
 > It's fair to say that this will lead to value leakage, so I think `medium` severity is justified.



***

## [[M-02] Missing payable](https://github.com/code-423n4/2022-01-openleverage-findings/issues/61)
_Submitted by robee_

The following functions are not payable but uses msg.value - therefore the function must be payable.
This can lead to undesired behavior.

        LPool.sol, addReserves should be payable since using msg.value

**[ColaM12 (OpenLeverage) confirmed and resolved](https://github.com/code-423n4/2022-01-openleverage-findings/issues/61)**

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/61#issuecomment-1045990204):**
 > Nice find! The warden has identified a function which is missing the `payable` keyword. Preventing any users from adding reserves using native ether.



***

## [[M-03] Eth sent to Timelock will be locked in current implementation](https://github.com/code-423n4/2022-01-openleverage-findings/issues/80)
_Submitted by defsec_

Eth sent to Timelock will be locked in current implementation. I came across this problem while playing around with the governance contract.

#### Proof of Concept

*   Setup the governance contracts (GovernanceAlpha, Timelock)
*   Send eth to timelock contract
*   Setup a proposal to send 0.1 eth out. Code snippet in ether.js below. proxy refers to GovernorAlpha.

<!---->

        await proxy.propose(
          [signers[3].address],
          [ethers.utils.parseEther("0.1")],
          [""],
          [ethers.BigNumber.from(0)],
          "Send funds to 3rd signer"
        );

*   Vote and have the proposal succeed.
*   Execute the proposal, the proposal number here is arbitrary.

<!---->

    await proxy.execute(2);  // this fails
    await proxy.execute(2, {value: ethers.utils.parseEther("0.1")})  // this would work
    0.1 eth will be sent out, but it is sent from the msg.sender not from the timelock contract.

#### Recommended Mitigation Steps

Consider implementing the following code.

        function execute(uint proposalId) external {
            require(state(proposalId) == ProposalState.Queued, "GovernorAlpha::execute: proposal can only be executed if it is queued");
            Proposal storage proposal = proposals[proposalId];
            proposal.executed = true;
            for (uint i = 0; i < proposal.targets.length; i++) {
                timelock.executeTransaction(proposal.targets[i], proposal.values[i], proposal.signatures[i], proposal.calldatas[i], proposal.eta);
            }
            emit ProposalExecuted(proposalId);
        }

#### Reference

<https://github.com/compound-finance/compound-protocol/pull/177/files>

**[ColaM12 (OpenLeverage) acknowledged](https://github.com/code-423n4/2022-01-openleverage-findings/issues/80)**

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/80#issuecomment-1045994865):**
 > I agree with this finding!



***

## [[M-04] OpenLevV1.closeTrade with V3 DEX doesn't correctly accounts fee on transfer tokens for repayments](https://github.com/code-423n4/2022-01-openleverage-findings/issues/104)
_Submitted by hyh_

The amount that OpenLevV1 will receive can be less than V3 DEX indicated as a swap result, while it is used as given for position debt repayment accounting.

This way actual funds received can be less than accounted, leaving to system funds deficit, which can be exploited by a malicious user, draining contract funds with multiple open/close with a taxed token.

In the `trade.depositToken != longToken` case when `flashSell` is used this can imply inability to send remainder funds to a user and the failure of the whole closeTrade function, the end result is a freezing of user's funds within the system.

#### Proof of Concept

`trade.depositToken != longToken` case, can be wrong repayment accounting, which will lead to a deficit if the received funds are less than DEX returned `closeTradeVars.receiveAmount`.

As a side effect, `doTransferOut` is done without balance check, so the whole position close can revert, leading to inability to close the position and freeze of user's funds this way:

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/OpenLevV1.sol#L197-204>

I.e. if there is enough funds in the system they will be drained, if there is not enough funds, user's position close will fail.

V3 sell function doesn't check for balance change, using DEX returned amount as is:

<https://github.com/code-423n4/2022-01-openleverage/blob/main/openleverage-contracts/contracts/dex/eth/UniV3Dex.sol#L61-70>

#### Recommended Mitigation Steps

If fee on tranfer tokens are fully in scope, do control all the accounting and amounts to be returned to a user via balance before/after calculations for DEX V3 logic as well.

**[ColaM12 (OpenLeverage) confirmed and resolved](https://github.com/code-423n4/2022-01-openleverage-findings/issues/104)**

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/104#issuecomment-1045996325):**
 > Awesome find. I was able to confirm that `UniV3Dex.uniV3Sell()` does not properly handle fee-on-transfer tokens by treating the amount received as the difference between before balance and after balance.



***

## [[M-05] anti-flashloan mechanism may lead to protocol default](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233)
_Submitted by gzeon_

There is a price check to avoid flash loan attacks which significantly moved the price. If current price is 5% lower than the stored twap price, the liquidation will fail. This design can be dangerous as it is to openleverage's benefit to close under-collateralized position ASAP when there is a huge market drawdown. When the market keep trading downward, it is possible that the spot price keep trading 5% lower than the twap, which prevent any liquidation from happening and causing the protocol to be under-collateralized.

#### Proof of Concept

<https://github.com/code-423n4/2022-01-openleverage/blob/501e8f5c7ebaf1242572712626a77a3d65bdd3ad/openleverage-contracts/contracts/OpenLevV1Lib.sol#L191>

                // Avoid flash loan
                if (prices.price < prices.cAvgPrice) {
                    uint differencePriceRatio = prices.cAvgPrice.mul(100).div(prices.price);
                    require(differencePriceRatio - 100 < maxLiquidationPriceDiffientRatio, 'MPT');
                }

#### Recommended Mitigation Steps

Instead of revert with `maxLiquidationPriceDiffientRatio`, use the twap price to determine if the position is healthy.

**[ColaM12 (OpenLeverage) disputed](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233)**

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1045995096):**
 > From first impression, this finding seems legitimate. Can I get some more details on why it was disputed? @ColaM12 

**[ColaM12 (OpenLeverage) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1046409471):**
 > There is always a chance to front run a flash loan transaction before trading in OpenLev. Also, see in line [196]( https://github.com/code-423n4/2022-01-openleverage/blob/501e8f5c7ebaf1242572712626a77a3d65bdd3ad/openleverage-contracts/contracts/OpenLevV1Lib.sol#L196), position is considered not healthy only if all three price check failed including the twap price.

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1046517723):**
 > It looks like only one condition would need to be satisfied for `isPositionHealthy` to return false as it uses `||` and not `&&`.

**[ColaM12 (OpenLeverage) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1046560642):**
 > Do you mean return true? All 3 price checks should fail when liquidating. But the position may still hold funds to pay off debt. by using maxLiquidationPriceDiffientRatio, under-priced-swaps can be limited . Otherwise, all remaining funds in the position could be drained from a flash loan attack which directly leads to a bad debt to lender.

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1046580257):**
 > Ahh sorry my mistake. I misinterpreted that.
 >
 > I agree with the sponsor here. The issue outlined by the warden seems to be safeguarded by the two other checks in `isPositionHealthy()`

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1046623163):**
 > Actually thinking about this more, I think the warden raised an issue related to the liquidations continuing to fail if the price keeps trending downward at an accelerated pace. I don't think the protocol would be able to respond to such events if [this](https://github.com/code-423n4/2022-01-openleverage/blob/501e8f5c7ebaf1242572712626a77a3d65bdd3ad/openleverage-contracts/contracts/OpenLevV1Lib.sol#L194) reverts.

**[0xleastwood (judge) commented](https://github.com/code-423n4/2022-01-openleverage-findings/issues/233#issuecomment-1046665362):**
 > After discussion with the sponsor, we have agreed that this issue is valid. It is expected that the TWAP is only valid for 1 min. By removing this condition, there is potential for even larger security issues. So the sponsor has decided to make this a wont-fix but I'll keep the issue open as it is valid.
 >
 > This was an awesome find!



***

# Low Risk Findings (15)
- [[L-01] Funds can be lost](https://github.com/code-423n4/2022-01-openleverage-findings/issues/220) _Submitted by csanuragjain_
- [[L-02] endTime can be before startTime](https://github.com/code-423n4/2022-01-openleverage-findings/issues/160) _Submitted by samruna, also found by defsec and WatchPug_
- [[L-03] transfer() may break in future ETH upgrade](https://github.com/code-423n4/2022-01-openleverage-findings/issues/228) _Submitted by gzeon, also found by pauliax_
- [[L-04] The check for `max rate 1000 ole` should be inclusive](https://github.com/code-423n4/2022-01-openleverage-findings/issues/164) _Submitted by Dravee_
- [[L-05] User reward can get stuck](https://github.com/code-423n4/2022-01-openleverage-findings/issues/215) _Submitted by csanuragjain_
- [[L-06] Anyone can call release() in OLETokenLock.sol](https://github.com/code-423n4/2022-01-openleverage-findings/issues/56) _Submitted by jayjonah8_
- [[L-07] Race condition in approve()](https://github.com/code-423n4/2022-01-openleverage-findings/issues/87) _Submitted by cccz, also found by defsec, mics, and sirhashalot_
- [[L-08] Anyone can claim airdrop amounts on behalf of anyone](https://github.com/code-423n4/2022-01-openleverage-findings/issues/107) _Submitted by cmichel_
- [[L-09] Assert instead require to validate user inputs](https://github.com/code-423n4/2022-01-openleverage-findings/issues/43) _Submitted by mics, also found by defsec, Dravee, and hyh_
- [[L-10] Anyone can crash transferTo](https://github.com/code-423n4/2022-01-openleverage-findings/issues/261) _Submitted by pauliax_
- [[L-11] UniV2Dex and UniV2ClassDex use hard coded factory addresses for Pair and PairFees getters](https://github.com/code-423n4/2022-01-openleverage-findings/issues/64) _Submitted by hyh_
- [[L-12] Mult instead div in compares](https://github.com/code-423n4/2022-01-openleverage-findings/issues/23) _Submitted by mics_
- [[L-13] In the following public update functions no value is returned](https://github.com/code-423n4/2022-01-openleverage-findings/issues/44) _Submitted by mics_
- [[L-14] UniV3Dex uniV3Buy slippage check error message is misleading](https://github.com/code-423n4/2022-01-openleverage-findings/issues/88) _Submitted by hyh_
- [[L-15] Bad actor may steal deposit return when liquidating a trade](https://github.com/code-423n4/2022-01-openleverage-findings/issues/195) _Submitted by jonah1005_

# Non-Critical Findings (22)
- [[N-01] Require with empty message](https://github.com/code-423n4/2022-01-openleverage-findings/issues/30) _Submitted by mics_
- [[N-02] Require with not comprehensive message](https://github.com/code-423n4/2022-01-openleverage-findings/issues/31) _Submitted by mics_
- [[N-03] transferAllowed does not fail](https://github.com/code-423n4/2022-01-openleverage-findings/issues/83) _Submitted by GeekyLumberjack_
- [[N-04] The initialize function can be called multiple times](https://github.com/code-423n4/2022-01-openleverage-findings/issues/67) _Submitted by cccz, also found by 0x1f8b, Dravee, Fitraldys, hyh, p4st13r4, rfa, sirhashalot, and wuwe1_
- [[N-05] no validation checks in ControllerV1.sol initialize function()](https://github.com/code-423n4/2022-01-openleverage-findings/issues/57) _Submitted by jayjonah8, also found by 0v3rf10w, cccz, Dravee, and hyh_
- [[N-06] `ControllerStorage`: related market data should be grouped in a struct](https://github.com/code-423n4/2022-01-openleverage-findings/issues/146) _Submitted by Dravee_
- [[N-07] No validation for constructor arguments in OLEToken.sol](https://github.com/code-423n4/2022-01-openleverage-findings/issues/53) _Submitted by jayjonah8_
- [[N-08] Multiple potential reentrancies](https://github.com/code-423n4/2022-01-openleverage-findings/issues/270) _Submitted by 0v3rf10w_
- [[N-09] Use of tx.origin in ControllerV1.sol](https://github.com/code-423n4/2022-01-openleverage-findings/issues/60) _Submitted by jayjonah8_
- [[N-10] Two arrays length mismatch](https://github.com/code-423n4/2022-01-openleverage-findings/issues/46) _Submitted by mics_
- [[N-11] No Transfer Ownership Pattern](https://github.com/code-423n4/2022-01-openleverage-findings/issues/65) _Submitted by cccz, also found by Dravee_
- [[N-12] mint() function doesn't require 0 to be larger than 0](https://github.com/code-423n4/2022-01-openleverage-findings/issues/55) _Submitted by jayjonah8_
- [[N-13] FarmingPools' notifyRewardAmounts and initDistributions do not check the lengths of input arrays](https://github.com/code-423n4/2022-01-openleverage-findings/issues/76) _Submitted by hyh_
- [[N-14] Unused parameters in OpenLevV1 and ControllerV1 functions](https://github.com/code-423n4/2022-01-openleverage-findings/issues/79) _Submitted by hyh, also found by samruna_
- [[N-15] Named return issue](https://github.com/code-423n4/2022-01-openleverage-findings/issues/39) _Submitted by mics_
- [[N-16] Misc](https://github.com/code-423n4/2022-01-openleverage-findings/issues/198) _Submitted by 0x1f8b_
- [[N-17] Last reward is discarded when reward added twice](https://github.com/code-423n4/2022-01-openleverage-findings/issues/218) _Submitted by csanuragjain_
- [[N-18] Not verified input](https://github.com/code-423n4/2022-01-openleverage-findings/issues/49) _Submitted by mics_
- [[N-19] Does not validate the input fee parameter](https://github.com/code-423n4/2022-01-openleverage-findings/issues/50) _Submitted by mics_
- [[N-20] Never used parameters](https://github.com/code-423n4/2022-01-openleverage-findings/issues/45) _Submitted by mics_
- [[N-21] Unused imports](https://github.com/code-423n4/2022-01-openleverage-findings/issues/2) _Submitted by mics_
- [[N-22] Timelock.sol modification removes logic checks](https://github.com/code-423n4/2022-01-openleverage-findings/issues/247) _Submitted by sirhashalot_

# Gas Optimizations (40)
- [[G-01] Gas: Tautology on "variable >= 0" which is always true as variable is uint](https://github.com/code-423n4/2022-01-openleverage-findings/issues/132) _Submitted by Dravee, also found by 0v3rf10w, gzeon, and pauliax_
- [[G-02] Optimize `OpenLevV1.sol#addMarket`](https://github.com/code-423n4/2022-01-openleverage-findings/issues/250) _Submitted by 0x0x0x_
- [[G-03] Prefix increments are cheaper than postfix increments](https://github.com/code-423n4/2022-01-openleverage-findings/issues/13) _Submitted by mics, also found by 0x1f8b, defsec, Dravee, IllIllI, m_smirnova2020, p4st13r4, and throttle_
- [[G-04] State variables that could be set immutable](https://github.com/code-423n4/2022-01-openleverage-findings/issues/11) _Submitted by mics, also found by 0x1f8b, gzeon, pauliax, Ruhum, and throttle_
- [[G-05] Gas saving optimizing setImplementation](https://github.com/code-423n4/2022-01-openleverage-findings/issues/115) _Submitted by 0x1f8b_
- [[G-06] Gas saving optimizing storage](https://github.com/code-423n4/2022-01-openleverage-findings/issues/116) _Submitted by 0x1f8b, also found by Dravee_
- [[G-07] Gas Optimization: Tight variable packing in `LPoolStorage.sol`](https://github.com/code-423n4/2022-01-openleverage-findings/issues/140) _Submitted by Dravee_
- [[G-08] Gas: "constants" expressions are expressions, not constants. Use "immutable" instead.](https://github.com/code-423n4/2022-01-openleverage-findings/issues/123) _Submitted by Dravee, also found by pauliax_
- [[G-09] Use bytes32 instead of string to save gas whenever possible](https://github.com/code-423n4/2022-01-openleverage-findings/issues/3) _Submitted by mics, also found by Dravee_
- [[G-10] Caching array length can save gas](https://github.com/code-423n4/2022-01-openleverage-findings/issues/15) _Submitted by mics, also found by defsec, Dravee, pauliax, throttle, and WatchPug_
- [[G-11] Short the following require messages](https://github.com/code-423n4/2022-01-openleverage-findings/issues/6) _Submitted by robee, also found by Dravee, mics, and sirhashalot_
- [[G-12] Upgrade pragma to at least 0.8.4](https://github.com/code-423n4/2022-01-openleverage-findings/issues/18) _Submitted by mics, also found by defsec, Dravee, and gzeon_
- [[G-13] Gas: Shift Right instead of Dividing by 2](https://github.com/code-423n4/2022-01-openleverage-findings/issues/131) _Submitted by Dravee_
- [[G-14] Use != 0 instead of > 0](https://github.com/code-423n4/2022-01-openleverage-findings/issues/21) _Submitted by mics, also found by Dravee and gzeon_
- [[G-15] Use calldata instead of memory](https://github.com/code-423n4/2022-01-openleverage-findings/issues/29) _Submitted by mics, also found by defsec, Dravee, rfa, Ruhum, Tomio, and WatchPug_
- [[G-16] Gas in `Adminable.sol:acceptAdmin()`: SLOADs minimization](https://github.com/code-423n4/2022-01-openleverage-findings/issues/137) _Submitted by Dravee, also found by Fitraldys, mics, p4st13r4, pauliax, Tomio, and WatchPug_
- [[G-17] Gas: `// Shh - currently unused`](https://github.com/code-423n4/2022-01-openleverage-findings/issues/153) _Submitted by Dravee, also found by sirhashalot_
- [[G-18] Gas in `LPool.sol:availableForBorrow()`: Avoid expensive calculation with an inclusive inequality](https://github.com/code-423n4/2022-01-openleverage-findings/issues/148) _Submitted by Dravee_
- [[G-19] Inline one time use functions](https://github.com/code-423n4/2022-01-openleverage-findings/issues/26) _Submitted by mics, also found by Dravee and robee_
- [[G-20] Unnecessary equals boolean](https://github.com/code-423n4/2022-01-openleverage-findings/issues/20) _Submitted by mics, also found by Dravee_
- [[G-21] Using `require` instead of `&&` can save gas](https://github.com/code-423n4/2022-01-openleverage-findings/issues/63) _Submitted by Tomio, also found by rfa_
- [[G-22] Unused library `ReentrancyGuard`](https://github.com/code-423n4/2022-01-openleverage-findings/issues/209) _Submitted by WatchPug, also found by defsec_
- [[G-23] Gas savings and corrections](https://github.com/code-423n4/2022-01-openleverage-findings/issues/212) _Submitted by csanuragjain_
- [[G-24] Gas Optimization: No need to use SafeMath everywhere](https://github.com/code-423n4/2022-01-openleverage-findings/issues/225) _Submitted by gzeon_
- [[G-25] Gas Optimization: Redundant check](https://github.com/code-423n4/2022-01-openleverage-findings/issues/236) _Submitted by gzeon_
- [[G-26] OpenLevV1.closeTrade can save trade.deposited to memory](https://github.com/code-423n4/2022-01-openleverage-findings/issues/102) _Submitted by hyh_
- [[G-27] uniV2Buy calls buyAmount.toAmountBeforeTax twice, while it's constant](https://github.com/code-423n4/2022-01-openleverage-findings/issues/86) _Submitted by hyh_
- [[G-28] Unnecessary array boundaries check when loading an array element twice](https://github.com/code-423n4/2022-01-openleverage-findings/issues/12) _Submitted by mics_
- [[G-29] Check if amount is not zero to save gas](https://github.com/code-423n4/2022-01-openleverage-findings/issues/19) _Submitted by mics_
- [[G-30] Unused inheritance](https://github.com/code-423n4/2022-01-openleverage-findings/issues/22) _Submitted by mics_
- [[G-31] using > instead of >=](https://github.com/code-423n4/2022-01-openleverage-findings/issues/100) _Submitted by rfa_
- [[G-32] unnecessary uint declaration](https://github.com/code-423n4/2022-01-openleverage-findings/issues/117) _Submitted by rfa_
- [[G-33] use require instead if/else](https://github.com/code-423n4/2022-01-openleverage-findings/issues/121) _Submitted by rfa_
- [[G-34] set pancakeFactory to constant](https://github.com/code-423n4/2022-01-openleverage-findings/issues/66) _Submitted by rfa_
- [[G-35] unnecessary _unsedFactory call](https://github.com/code-423n4/2022-01-openleverage-findings/issues/68) _Submitted by rfa_
- [[G-36] pass the `dexInfo[dexName[i]` value without caching `DexInfo struct`](https://github.com/code-423n4/2022-01-openleverage-findings/issues/71) _Submitted by rfa_
- [[G-37] caching struct data type in memory cost more gas](https://github.com/code-423n4/2022-01-openleverage-findings/issues/72) _Submitted by rfa_
- [[G-38] declaring that contract is using `Utils` lib can use more gas](https://github.com/code-423n4/2022-01-openleverage-findings/issues/73) _Submitted by rfa_
- [[G-39] unnecessary msg.sender cache](https://github.com/code-423n4/2022-01-openleverage-findings/issues/77) _Submitted by rfa_
- [[G-40] Gas saving by caching state variables](https://github.com/code-423n4/2022-01-openleverage-findings/issues/82) _Submitted by tqts_

# Disclosures

C4 is an open organization governed by participants in the community.

C4 Contests incentivize the discovery of exploits, vulnerabilities, and bugs in smart contracts. Security researchers are rewarded at an increasing rate for finding higher-risk issues. Contest submissions are judged by a knowledgeable security researcher and solidity developer and disclosed to sponsoring developers. C4 does not conduct formal verification regarding the provided code but instead provides final verification.

C4 does not provide any guarantee or warranty regarding the security of this project. All smart contract software should be used at the sole risk and responsibility of users.
