const getItem = jest.fn(() => Promise.resolve(null));
const setItem = jest.fn(() => Promise.resolve());
const removeItem = jest.fn(() => Promise.resolve());
const multiGet = jest.fn(() => Promise.resolve([]));
const multiSet = jest.fn(() => Promise.resolve());
const multiRemove = jest.fn(() => Promise.resolve());
module.exports = {
  getItem,
  setItem,
  removeItem,
  multiGet,
  multiSet,
  multiRemove,
  default: { getItem, setItem, removeItem, multiGet, multiSet, multiRemove },
};
