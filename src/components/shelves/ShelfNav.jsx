import React, { useEffect, useState } from "react";
import styled from "./ShelfNav.module.css";
import { IoAddCircleSharp } from "react-icons/io5";
import { useSelector } from "react-redux";

import Modal from "../helpers/modal/Modal";
import CreateShelf from "./CreateShelf";
import ContextMenu from "./ContextMenu";
import ContextMenuAction from "./ContextMenuAction";

const ShelfNav = ({ searchParams, setSearchParams }) => {
  //states and context
  const { shelf } = useSelector((state) => state.bookShelf);
  const [shelfName, setShelfName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [positions, setPositions] = useState({ top: 0, left: 0 });
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [openMenuAction, setOpenMenuAction] = useState(false);
  const [action, setAction] = useState(null);

  //functions
  const addHandler = () => setOpenModal((state) => !state);
  const handleShelfName = (shelf) => setShelfName(shelf);

  //function to open context menu and set the position of the menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    const shelfLabel = e.currentTarget.dataset.shelf;
    if (!shelfLabel) return;
    setShowContextMenu(true);
    setSelectedShelf(shelfLabel);
    setPositions({ top: e.pageY, left: e.pageX });
  };

  //function to close the context menu
  useEffect(() => {
    const closeContextMenu = () => setShowContextMenu(false);
    window.addEventListener("click", closeContextMenu);

    //cleanup function to remove the event listener
    return () => window.removeEventListener("click", closeContextMenu);
  }, [showContextMenu]);

  //get current shelf from url
  const currentShelf = searchParams.get("shelf");
  const isAllActive = !currentShelf || currentShelf === "All";

  //update the search params when the shelf changes
  useEffect(() => {
    if (shelfName) {
      setSearchParams({ shelf: shelfName });
    }
  }, [shelfName, setSearchParams]);

  // get the shelves created by the user and apply correct className to the current shelf
  const links = shelf?.shelves?.map((shelf, index) => (
    <button
      key={shelf}
      type="button"
      data-shelf={shelf}
      onClick={() => handleShelfName(shelf)}
      className={`${styled.chip} ${
        currentShelf === shelf ? styled.active : ""
      }`}
      style={{ "--i": index + 1 }}
      onContextMenu={handleContextMenu}
    >
      <span className={styled.dot} aria-hidden="true" />
      {shelf}
    </button>
  ));

  return (
    <>
      <nav className={styled["shelf-navbar"]}>
        <div className={styled["shelf-head"]}>
          <div className={styled["shelf-title"]}>
            <span className={styled.eyebrow}>Sort your books</span>
            <button
              type="button"
              className={`${styled.chip} ${styled.all} ${
                isAllActive ? styled.active : ""
              }`}
              onClick={() => setShelfName("All")}
              style={{ "--i": 0 }}
            >
              <span className={styled.dot} aria-hidden="true" />
              All books
            </button>
          </div>
          <button type="button" className={styled.add} onClick={addHandler}>
            <IoAddCircleSharp size="22px" />
            <span>New shelf</span>
          </button>
        </div>
        <div className={styled["shelf-links"]}>{links}</div>
      </nav>

      {openModal && (
        <Modal setOpenModal={setOpenModal} openModal={openModal}>
          <CreateShelf setOpenModal={setOpenModal} />
        </Modal>
      )}

      {/* show custom context menu */}
      {showContextMenu && (
        <ContextMenu
          setAction={setAction}
          positions={positions}
          setOpenMenuAction={setOpenMenuAction}
        />
      )}

      {/* show rename shelf modal */}
      {openMenuAction && (
        <Modal setOpenModal={setOpenMenuAction} openModal={openMenuAction}>
          <ContextMenuAction
            action={action}
            selectedShelf={selectedShelf}
            setSearchParams={setSearchParams}
            setOpenMenuAction={setOpenMenuAction}
            searchParams={searchParams}
          />
        </Modal>
      )}
    </>
  );
};

export default ShelfNav;
