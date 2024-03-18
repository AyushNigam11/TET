import React, { useState, useEffect } from "react";
import "../../styles/tab6.css";
import { makeStyles } from "@material-ui/core/styles";
import Pagination from "@mui/material/Pagination";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import Saved from "../popup/Saved";
import { Button, Dialog, DialogContent, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ContractsDetails from "../popup/ContractsDetails";
import moment from "moment";
import {
  getSupplierManagement,
  deleteSupplier,
  updateSupplier,
} from "../../Services/SupplierManagementService";
import axios from "axios";
import Viewpage from "../view-profile-page/header/Vendors";
import { Link, useNavigate } from "react-router-dom";
import RfqApproval from "../tabsComponent/RfqApproval";
import SupplierApproval from "../tabsComponent/SupplierApproval";

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      marginTop: theme.spacing(2),
    },
  },
}));
const Tab6 = () => {
  const [vendorId, setvendorId] = useState();
  const navigate = useNavigate();
  const [balancedSheetLink, setBalancedSheetLink] = useState({
    link: null,
    file: null,
  });
  const [cashFlowDocLink, setCashFlowDocLink] = useState({
    link: null,
    file: null,
  });
  const [profitLossDocLink, setProfitLossDocLink] = useState({
    link: null,
    file: null,
  });
  const classes = useStyles();
  const [submit, setSubmit] = useState(false);
  const [agreementRenewalDate, setAgreementRenewalDate] = useState("");
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [supplierData, setSupplierData] = useState(null);
  const pageSize = 5;

  const handleClose = () => {
    setPopupOpen(false);
  };
  const fetchSupplierData = async (supplierId) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const response = await axios.get(
        `https://foxl-api.pb18.in/api/supplier/single/${supplierId}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        }
      );

      if (response.status === 200) {
        setSupplierData(response.data); // Set the fetched data to state
      } else {
        console.error("Failed to fetch supplier details");
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
    }
  };
  const handleFileChange = async (e, setFileState, setLinkState) => {
    const file = e.target.files[0];
    setFileState(file);

    try {
      const bearerToken = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/file/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const fileLink = response.data.data.fileLink;

      setLinkState({ link: fileLink, file: file });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCloseModal = () => {
    setEditModal(false);
  };

  const handleEditIcon = (vendorId) => {
    setEditModal(true);
    setvendorId(vendorId);
  };

  const handleDelete = async (supplierId, index, e) => {
    try {
      await deleteSupplier(supplierId);
      var row = e.target.parentNode.parentNode;
      row.parentNode.remove(row);
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const editNavigate = (userID) => {
    navigate(`/edit-vendor-details/${userID}`);
  };

  const handleNavigate = (userID) => {
    navigate(`/view-vendor-details/${userID}`);
  };

  const handleEditClick = (supplierId) => {
    setEditing(supplierId);
    const editedSupplier = suppliers.find(
      (supplier) => supplier.id === supplierId
    );
    setEditedData({ ...editedSupplier });
  };

  const handleSaveClick = async (supplierId) => {
    try {
      const updatedData = {
        ...editedData,
        balancedSheetLink: balancedSheetLink.link,
        profitLossDocLink: profitLossDocLink.link,
        cashFlowDocLink: cashFlowDocLink.link,
      };
      setSuppliers((prevSuppliers) =>
        prevSuppliers.map((supplier) =>
          supplier.id === supplierId ? updatedData : supplier
        )
      );
      const bearerToken = localStorage.getItem("token");
      const response = await axios.put(
        `https://foxl-api.pb18.in/api/supplier/${vendorId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        console.log("Supplier details updated successfully");
        fetchData();
      } else {
        console.error("Failed to update supplier details");
      }

      setEditing(null);
      setEditModal(false);
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const fetchData = async () => {
    try {
      const supplierResponse = await getSupplierManagement(
        1,
        currentPage,
        pageSize
      );
      if (supplierResponse && supplierResponse.status) {
        console.log("Supplier Data:", supplierResponse.data.suppliers);
        setSuppliers(supplierResponse.data.suppliers);
      } else {
        console.error("Failed to fetch supplier data");
      }
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" className="tooltip-email" {...props}>
      {props}
    </Tooltip>
  );

  const [suppliers, setSuppliers] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch supplier data
        const supplierResponse = await getSupplierManagement(
          1,
          currentPage,
          pageSize
        );
        if (supplierResponse && supplierResponse.status) {
          console.log("Supplier Data:", supplierResponse.data.suppliers);
          setSuppliers(supplierResponse.data.suppliers);
        } else {
          console.error("Failed to fetch supplier data");
        }
      } catch (error) {
        console.error("Error fetching supplier data:", error);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  console.log("fetch", suppliers);
  return (
    <div>
      {/* <div style={{display: "none"}}><Viewpage userID={userID} /></div> */}
      <div className="mainSection">
        <div className="border-section">
          <div>
            <div>
              <div
                className="fw-bol ps-4 pt-4 common-font"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Supplier Management
              </div>
            </div>
            <div className="d-flex flex-column mt-5 px-4">
              <div
                className="common-font"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "15px",
                  marginLeft: "5px",
                }}
              >
                Filters
              </div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="select-filter">
                  <select
                    className="  "
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    <option
                      className="px-3"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      Filters
                    </option>
                  </select>
                </div>
                <Link
                  to="/vendor-management-form"
                  style={{ textDecoration: "none" }}
                >
                  <button
                    className="add-vendor-btn"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "700",
                    }}
                  >
                    <span>+</span>Add a New Vendor
                  </button>
                </Link>
              </div>
            </div>

            <div
              className=" ps-4  common-font"
              style={{
                marginTop: "30px",
                fontFamily: "Poppins, sans-serif",
                fontSize: "18px",
              }}
            >
              Listed Vendors
            </div>

            <div style={{ overflowX: "auto" }}>
              <table className="mt-3 w-100 text-nowrap ">
                <thead className="table-head-data">
                  <tr
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      fontWeight: "300 !important",
                    }}
                    className="font-normal"
                  >
                    <>
                      <th
                        style={{
                          whiteSpace: "nowrap",
                          fontWeight: "normal !important",
                        }}
                      >
                        SL No.
                      </th>
                      <th>Name</th>
                      <th>Profile</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Company</th>
                      <th style={{ whiteSpace: "nowrap" }}>Registered Name </th>
                      <th>Date Added</th>
                      <th>Edit</th>
                      <th>Approval</th>
                      <th>Contracts</th>
                      <th> Status</th>
                      <th>Delete</th>
                    </>
                  </tr>
                </thead>
                <tbody className="table-body-data ">
                  {suppliers &&
                    suppliers.map((supplier, index) => (
                      <tr key={supplier.id}>
                        <td>{index + 1}</td>
                        <td>
                          {editing === supplier.id ? (
                            <Form.Control
                              type="text"
                              placeholder=" Name"
                              value={editedData.name}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  name: e.target.value,
                                })
                              }
                              style={{ backgroundColor: "#e8f2fe" }}
                            />
                          ) : (
                            <span onClick={() => handleNavigate(supplier.id)}>
                              {supplier.name}
                            </span>
                          )}
                        </td>
                        <td>
                          {editing === supplier.id ? (
                            <Form.Control
                              type="text"
                              placeholder="Profile"
                              value={editedData.profileSelection}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  profileSelection: e.target.value,
                                })
                              }
                              style={{ backgroundColor: "#e8f2fe" }}
                            />
                          ) : (
                            <span>{supplier.profileSelection}</span>
                          )}
                        </td>
                        <td>
                          {editing === supplier.id ? (
                            <Form.Control
                              type="text"
                              placeholder="Email"
                              value={editedData.email}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  email: e.target.value,
                                })
                              }
                              style={{ backgroundColor: "#e8f2fe" }}
                            />
                          ) : (
                            <span>{supplier.email}</span>
                          )}
                        </td>
                        <td>
                          {editing === supplier.id ? (
                            <Form.Control
                              type="text"
                              placeholder="Contact"
                              value={editedData.contactNumber}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  contactNumber: e.target.value,
                                })
                              }
                              style={{ backgroundColor: "#e8f2fe" }}
                            />
                          ) : (
                            <span>{supplier.contactNumber}</span>
                          )}
                        </td>
                        <td>
                          {editing === supplier.id ? (
                            <Form.Control
                              type="text"
                              placeholder="Company"
                              value={editedData.companyName}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  companyName: e.target.value,
                                })
                              }
                              style={{ backgroundColor: "#e8f2fe" }}
                            />
                          ) : (
                            <span>{supplier.companyName}</span>
                          )}
                        </td>
                        <td>
                          {editing === supplier.id ? (
                            <Form.Control
                              type="text"
                              placeholder="Registered Name"
                              value={editedData.registeredName}
                              onChange={(e) =>
                                setEditedData({
                                  ...editedData,
                                  registeredName: e.target.value,
                                })
                              }
                              style={{ backgroundColor: "#e8f2fe" }}
                            />
                          ) : (
                            <span>
                              {supplier.registeredName
                                ? supplier.registeredName
                                : "N/A"}
                            </span>
                          )}
                        </td>
                        <td>
                          {moment(supplier.createdAt).format("MMM Do, YY")}
                        </td>
                        <td>
                          {/* <img onClick={()=> editNavigate(supplier.id)}
                                                        src='/edit-fill.png'
                                                        
                                                    /> */}
                          <img
                            onClick={() => handleEditIcon(supplier.id)}
                            src="/edit-fill.png"
                          />
                        </td>

                        <td>
                          <SupplierApproval supplier={supplier} />
                        </td>
                        <td className="pointer">
                          <ContractsDetails />
                        </td>
                        <td className="bg-white">
                          <OverlayTrigger
                            trigger="hover"
                            placement="left"
                            delay={{ show: 250, hide: 400 }}
                            overlay={renderTooltip("Email yet to be Verified")}
                          >
                            <img
                              src="/inactive.png"
                              alt=""
                              style={{ width: "40px" }}
                            />
                          </OverlayTrigger>
                        </td>
                        {/* <td><DeleteIcon className='delete-icon-btn' onClick={e => handleDelete(index, e)} /></td> */}
                        <td>
                          <DeleteIcon
                            className="delete-icon-btn"
                            onClick={(e) => handleDelete(supplier.id, index, e)}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div
              className={classes.root}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "10px",
              }}
            >
              {/* <Pagination count={5} variant="outlined" shape="rounded" /> */}

              <Pagination
                count={5} // Change this based on your total number of pages
                variant="outlined"
                shape="rounded"
                page={currentPage}
                onChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </div>

      {editModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              width: "1350px",
              height: "100vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "10px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Edit Supplier Management
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "40px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItem: "center",
                  width: "50%",
                }}
              >
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Vendor Person Name<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.name}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Company Name<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.companyName || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      companyName: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Contact Number<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.contactNumber}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      contactNumber: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Email Address<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.email}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      email: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Facebook Link<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.facebookLink}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      facebookLink: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  LinkedIn Link<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.linkedInLink}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      linkedInLink: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Twitter Link<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.twitterLink}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      twitterLink: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
              </div>
              <div style={{ width: "50%" }}>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Company URL<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.companyUrl}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      companyUrl: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Address Line 1<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.addressLine1}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      addressLine1: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Address Line 2<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.addressLine2}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      addressLine2: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <div style={{ display: "flex", width: "100%", gap: "10px" }}>
                  <div style={{ width: "50%" }}>
                    <Form.Label
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "Poppins, sans-serif",
                        marginTop: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      State / Province<span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editedData.state}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          state: e.target.value,
                        })
                      }
                      className="person-name-input"
                    />
                  </div>
                  <div style={{ width: "50%" }}>
                    <Form.Label
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "Poppins, sans-serif",
                        marginTop: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      City<span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editedData.city}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          city: e.target.value,
                        })
                      }
                      className="person-name-input"
                    />
                  </div>
                </div>
                <div style={{ display: "flex", width: "100%", gap: "10px" }}>
                  <div style={{ width: "50%" }}>
                    <Form.Label
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "Poppins, sans-serif",
                        marginTop: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      Country<span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editedData.country}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          country: e.target.value,
                        })
                      }
                      className="person-name-input"
                    />
                  </div>
                  <div style={{ width: "50%" }}>
                    <Form.Label
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        fontFamily: "Poppins, sans-serif",
                        marginTop: "10px",
                        marginBottom: "5px",
                      }}
                    >
                      Zip Code<span style={{ color: "red" }}>*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editedData.zipCode}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          zipCode: e.target.value,
                        })
                      }
                      className="person-name-input"
                    />
                  </div>
                </div>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Tax Number<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.taxNo}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      taxNo: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Balance Sheet<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <div>
                  <label className="upload">
                    <input
                      accept="image/*"
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setBalancedSheetLink,
                          setBalancedSheetLink
                        )
                      }
                    />
                    <div className="d-flex justify-content-between">
                      Choose File
                      <img src="pin-white.png" style={{ width: "3%" }} />
                    </div>
                  </label>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Cash Flow<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <div>
                  <label className="upload">
                    <input
                      accept="image/*"
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setCashFlowDocLink,
                          setCashFlowDocLink
                        )
                      }
                    />
                    <div className="d-flex justify-content-between">
                      Choose File
                      <img src="pin-white.png" style={{ width: "3%" }} />
                    </div>
                  </label>
                </div>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "17px",
                    marginBottom: "5px",
                  }}
                >
                  Profit Loss<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <div>
                  <label className="upload">
                    <input
                      accept="image/*"
                      type="file"
                      hidden
                      onChange={(e) =>
                        handleFileChange(
                          e,
                          setProfitLossDocLink,
                          setProfitLossDocLink
                        )
                      }
                    />
                    <div className="d-flex justify-content-between">
                      Choose File
                      <img src="pin-white.png" style={{ width: "3%" }} />
                    </div>
                  </label>
                </div>
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "15px",
                    marginBottom: "5px",
                  }}
                >
                  Contract<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.contractFile}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      contractFile: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Agreement<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.agreementFile}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      agreementFile: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
                <Form.Label
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "Poppins, sans-serif",
                    marginTop: "10px",
                    marginBottom: "5px",
                  }}
                >
                  Additional Details<span style={{ color: "red" }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedData.additionalDetails}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      additionalDetails: e.target.value,
                    })
                  }
                  className="person-name-input"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "15px",
                gap: "20px",
              }}
            >
              <button
                style={{
                  display: "flex",
                  margin: "10px",
                  fontSize: "16px",
                  background: "rgb(99,179,141)",
                  fontFamily: "Poppins, sans-serif",
                  border: "none",
                  borderRadius: "5px",
                  padding: "15px 15px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "700",
                }}
                onClick={() => handleSaveClick(editedData.id)}
              >
                Update
              </button>
              <button
                style={{
                  display: "flex",
                  margin: "10px",
                  fontWeight: "700",
                  fontSize: "16px",
                  background: "rgb(255,0,0)",
                  fontFamily: "Poppins, sans-serif",
                  border: "none",
                  borderRadius: "5px",
                  padding: "15px 15px",
                  color: "white",
                  cursor: "pointer",
                }}
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tab6;
