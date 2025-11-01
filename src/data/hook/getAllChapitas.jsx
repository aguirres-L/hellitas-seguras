import { getAllDataCollection } from "../firebase";

export const getAllChapitas = async () => {
  try {
    const chapitas = await getAllDataCollection('pagoChapita');
    return chapitas;
  } catch (error) {
    console.error('Error:', error);
  }
};