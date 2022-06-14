import React, { useEffect, useState } from "react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import axios from "axios";
import { BACKEND_SERVER } from "..//URLConfig";
import {BiSave} from 'react-icons/bi';
import {BsLockFill} from 'react-icons/bs';
import {BsFiles} from 'react-icons/bs';
import "./home.css";

const EditorX = () => {
  const [text, setText] = useState("");
  const [shortURL, setShortURL] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isURL, setIsURL] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [encryptedText, setEncryptedText] = useState("");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const getNewFileName = async () => {
      const res = await axios.get(`${BACKEND_SERVER}/getNumberOfUntitledFiles`);
      let fileName = `Untitled ${res.data.count + 1}`;
      setFileName(fileName);
    };
    getNewFileName();
  }, []);

  useEffect(() => {
    if(validURL(parseText())){
      setIsURL(true);
    }
    else{
      setIsURL(false);
    }
  }, [text]);

  const onOpenModal = () => {
    setOpen(true);
  };
  const onCloseModal = () => {
    setOpen(false);
    setIsClicked(false);
  };
  const parseText = () => {
    var htmlString = text;
    var plainString = htmlString.replace(/<[^>]+>/g, "");
    return plainString;
  };

  const validURL = (str) => {
    var pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  };

  const getURL = async () => {
    // console.log("chal jaa");
    if (validURL(parseText())) {
      //api call
      onOpenModal();
      setIsClicked(true);
      const longURL = parseText();
      const res = await axios.get(
        `https://api.shrtco.de/v2/shorten?url=${longURL}`
      );
      onOpenModal();
      setShortURL(res.data.result.short_link);
      setIsClicked(true);
    } else {
      saveData();
    }
  };

  const saveData = async () => {
    if (!fileName || !text) {
      toast.error("Please Add all the Fields", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      const res = await axios.get("https://ipapi.co/json/");
      const ipAdd = res.data.ip;
      const createdAt = new Date().getTime();
      const expiryAt = createdAt + 86400000;
      const firstAccess = [
        {
          time: createdAt,
          ip: ipAdd,
        },
      ];
      await fetch(`${BACKEND_SERVER}/saveData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName,
          data: isEncrypted ? encryptedText : text,
          isEncrypted: isEncrypted,
          expiryDate: expiryAt,
          accessLogs: firstAccess,
        }),
      })
        .then((res) => {
          res.json().then((doc) => {
            // console.log(doc.data._id);
            toast.success("Succesfully Saved !", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            navigate(`/file/${doc.data._id}`);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const encryptData = async () => {
    try {
      const response = await axios.post(`${BACKEND_SERVER}/encryptData`, {
        data: text,
        key: encryptionKey,
      });
      setIsEncrypted(true);
      setEncryptedText(response.data.encryptedData);
      toast.success("Encrypted Successfully !", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="viewPage">
        <div className="editorContainer">
          <div className="headingContainer">
            <h1 className="mainHeading" >
              TextStore
            </h1>
          </div>
          <div className="top">
            <div>
              <input
                type="text"
                placeholder="Enter your filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <Link to="/allFiles">
              <button className="btn">
                <div className="insideButton">
                  <BsFiles className="icon" />
                  All Files
                </div>
              </button>
            </Link>
          </div>
        
          <CKEditor
            editor={ClassicEditor}
            data={text}
            onChange={(event, editor) => {
              const data = editor.getData();
              setText(data);
            }}
          />
  
         
        </div>
        <div className="modalBtnContainer">
          <button className="btn" onClick={getURL}>
            <div className="insideButton">
              <BiSave className="icon" />
              {isURL ? "Get Short URL" : "Save"}
            </div>
          </button>
          <button
            className="btn"
            onClick={() => {
              if (!fileName || !text) {
                toast.error("Please Add all the Fields", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              } else {
                onOpenModal();
              }
            }}
          >
          <div className="insideButton" >
            <BsLockFill className="icon" />
            Encrypt
          </div>
          </button>
        </div>
      </div>
      <Modal open={open} onClose={onCloseModal} center>
        <h2 className="modalText">Share</h2>
        {isClicked ? (
          shortURL ? (
            <div>
              <input type="text" className="modalInput" value={shortURL} />
              <div className="modalBtnContainer">
                <button
                  className="btn modalBtn"
                  onClick={() => {
                    navigator.clipboard.writeText(shortURL);
                    toast.warn("Copied !", {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    });
                  }}
                >
                  Copy to Clipboard!
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="modalText generating">Generating..</h3>
            </div>
          )
        ) : (
          <div>
            <div>
              <input
                type="password"
                className="modalInput"
                placeholder="Enter your key to encrypt"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
              />
            </div>
            <div className="modalBtnContainer">
              <button
                className="btn modalBtn"
                onClick={isEncrypted ? () => saveData() : () => encryptData()}
              >
                {isEncrypted ? "Save" : "Encrypt"}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default EditorX;
