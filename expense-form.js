(function() {
  const utils = window.expenseManager.utils;

  // Cached DOM bindings
  const byID = document.getElementById.bind(document);
  const expenseForm = byID('expense-form');
  const descriptionEl = byID('expense-description');
  const dateEl = byID('expense-date');
  const accountEl = byID('expense-account');
  const accountElUl = byID('expense-account-ul');
  const categoryEl = byID('expense-category');
  const categoryElUl = byID('expense-category-ul');
  const amountEl = byID('expense-amount');
  const isIncomeEl = byID('is-income');
  const isYearlyEl = byID('is-yearly');
  //const isYearlyElUl = byID('is-yearly-ul');
  const addExpenseBtn = byID('add-expesne');
  const snackbarContainer = byID('toast-container');

  /**
   * Append expense to the expense sheet
   */
  function addExpense(event) {
    if (!expenseForm.checkValidity()) return false;

    event.preventDefault();
    utils.showLoader();

    const expenseDate = dateEl.value;
    const descriptionVal = descriptionEl.value;
    const accountVal = accountEl.value;
    const categoryVal = categoryEl.value;
    const amountVal = amountEl.value;
    const isIncome = isIncomeEl.checked;
    const isYearly = isYearlyEl.checked;

    const dateObj = {
      yyyy: expenseDate.substr(0, 4),
      mm: expenseDate.substr(5, 2),
      dd: expenseDate.substr(-2),
    };
    gapi.client.sheets.spreadsheets.values
      .append(
        utils.appendRequestObj([
          [
            `=DATE(${dateObj.yyyy}, ${dateObj.mm}, ${dateObj.dd})`,
            descriptionVal,
            accountVal,
            categoryVal,
            isIncome ? 0 : amountVal, // income amount
            isIncome ? amountVal : 0, // expense amount
            false, // is internal transfer?
            isYearly,
          ],
        ]),
      )
      .then(
        response => {
          // reset fileds
          descriptionEl.value = '';
          amountEl.value = '';
          snackbarContainer.MaterialSnackbar.showSnackbar({
            message: 'Expense added!',
          });
          utils.hideLoader();
        },
        response => {
          utils.hideLoader();
          let message = 'Sorry, something went wrong';
          if (response.status === 403) {
            message = 'Please copy the sheet in your drive';
          }
          console.log(response);
          snackbarContainer.MaterialSnackbar.showSnackbar({
            message,
            actionHandler: () => {
              window.open(
                'https://github.com/thesam73/expense-manager/blob/master/README.md#how-to-get-started',
                '_blank',
              );
            },
            actionText: 'Details',
            timeout: 5 * 60 * 1000,
          });
        },
      );
  }

  function init(sheetID, accounts, categories) {
    // set date picker's defalt value as today
    dateEl.value = new Date().toISOString().substr(0, 10);

    // initialize accounts and categories dropdown
    accounts.forEach(account => {
      accountElUl.appendChild(utils.wrapInLi(account));
    });
   

    categories.forEach(category => {
      categoryElUl.appendChild(utils.wrapInLi(category));
    });

    // var truefalse = ["TRUE", "FALSE"];
    // truefalse.forEach(category => {
    //   isYearlyElUl.appendChild(utils.wrapInLi(category));
    // });
    // isYearlyEl.value = "FALSE"
    isYearlyEl.checked = false;
    getmdlSelect.init(".getmdl-select");
    
    // set lister for `Save` button
    addExpenseBtn.onclick = addExpense.bind(null);
  }

  window.expenseManager.expenseForm = {
    init,
  };
})();
