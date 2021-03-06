import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import "./logs.css";
import { BACKEND_SERVER } from "../URLConfig"

const AccessLogs = () => {
  const { id } = useParams();
  const [fdata, setFData] = useState(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_SERVER}/file/${id}`)
      .then((res) => {
        setFData(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  if (fdata) {
    return (
      <div className="logPage viewPage">
        <div className="top">
          <Link to="/">
            <button className="btn">Create New</button>
          </Link>
          <Link to={"/file/" + id}>
            <button className="btn">Back</button>
          </Link>
        </div>
        <h1>Access Logs</h1>
        <div className="logContainer">
        <div className="row heading">
                <div className="sno"> S No.</div>
               <div className="date" > Time of Access</div>
               <div className="ip" >IP Address</div>
              </div>
          {fdata.accessLogs.map((item, index) => {
            return (
              <div className="row">
                <div className="sno">{index + 1} </div>
               <div className="date" > {new Date(item.time).toLocaleString()} </div>
               <div className="ip" >{item.ip}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    return (<div className="expireScreen">
   <h1 className="generating" >Loading...</h1>
    </div>);
  }
};

export default AccessLogs;
