import localforage from 'localforage';

export const getData = async (key) => {
  return await localforage.getItem(key);
};

export const setData = async (key, value) => {
  return await localforage.setItem(key, value);
};