import { useState, useEffect } from "react";
import axios from "axios";

export default function usestates() {
  const [State, setState] = useState([]);

  //get cat
  const getStates = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_APP_BACKEND}/api/v1/states/get-states`);
      setState(data?.state);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStates();
  }, []);

  return State;
}
