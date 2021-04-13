/**
 * Tests for CrowdsalesDetail sagas
 */

import { all, takeEvery } from 'redux-saga/effects';
import { testSaga } from 'redux-saga-test-plan';
import request from 'utils/request';
import encoderURIParams from 'utils/encoderURIParams';

import { ECOSYSTEM_PROD } from 'containers/App/constants';
import getLocationPath from 'utils/getLocationPath';
import { updateCrowdsaleTransactionsFetch } from 'containers/CrowdsaleDetail/actions';

import { LOAD_CROWDSALE_TRANSACTIONS } from '../constants';
import root, { getCrowdsaleTransactions } from '../saga';

const addr = '17ScKNXo4cL8DyfWfcCWu1uJySQuJm7iKx';

/* eslint-disable redux-saga/yield-effects */
describe('getCrowdsaleTransactions Saga', () => {
  let getCrowdsaleTransactionsGenerator;

  // We have to test twice, once for a successful load and once for an unsuccessful one
  // so we do all the stuff that happens beforehand automatically in the beforeEach
  beforeEach(() => {
    const ecosystem = ECOSYSTEM_PROD;
    // const saga = testSaga(getCrowdsaleTransactions, { ecosystem });
    getCrowdsaleTransactionsGenerator = getCrowdsaleTransactions({ ecosystem });

    const selectDescriptor = getCrowdsaleTransactionsGenerator.next().value;
    expect(selectDescriptor).toMatchSnapshot();

    const callDescriptor = getCrowdsaleTransactionsGenerator.next(addr).value;
    expect(callDescriptor).toMatchSnapshot();
  });

  it('should dispatch the updateCrowdsaleTransactionsFetch action if it requests the data successfully', () => {
    const response = {
      pages: 3,
      page: 3,
      total: 1,
      transactions: [],
    };

    const id = 31;
    const startPage = 3;
    const saga = testSaga(getCrowdsaleTransactions, {
      id,
      start: startPage,
      count: 1000,
    });
    const url = `${getLocationPath()}/properties/gethistory/${id}`;
    const body = encoderURIParams(
      {
        startPage,
        count: 1000,
      },
      true,
    );
    // const body = encoderURIParams({ start: startPage, count: 1000 }, true);

    const options = {
      method: 'POST',
      type: 'cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    };

    saga
      .next()
      .next({ currentPage: 0 })
      .call(request, url, options)
      .next(response)
      .put(
        updateCrowdsaleTransactionsFetch(
          response.transactions,
          response.pages,
          response.total,
          response.page,
        ),
      );
  });
});

describe('Crowdsales detail Saga', () => {
  it('should start task to watch for LOAD_CROWDSALES action', () => {
    // arrange
    const rootSaga = root();
    const expectedYield = all([
      takeEvery(LOAD_CROWDSALE_TRANSACTIONS, getCrowdsaleTransactions),
    ]);

    // act
    const actualYield = rootSaga.next().value;

    // assert
    expect(actualYield).toEqual(expectedYield);
  });
});
