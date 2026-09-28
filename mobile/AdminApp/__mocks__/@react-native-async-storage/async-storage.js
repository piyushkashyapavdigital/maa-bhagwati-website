const getItem = jest.fn();
const setItem = jest.fn();
const removeItem = jest.fn();
module.exports = {
  getItem,
  setItem,
  removeItem,
  default: { getItem, setItem, removeItem },
};
