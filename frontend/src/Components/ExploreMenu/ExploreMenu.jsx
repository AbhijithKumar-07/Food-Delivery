import React from "react";
import "./ExploreMenu.css";
import { menu_list } from "../../assets/assets";

const ExploreMenu = ({ category, setCategory }) => {
  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore Our Menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes.Our
        mission is to satisfy your cravings and elevate your dining experience,
        one delicious meal at a time.
      </p>
      <div className="explore-menu-list">
        {menu_list.map((ele, ind) => {
          return (
            <div
              onClick={() =>
                setCategory(() =>
                  category == ele.menu_name ? "All" : ele.menu_name
                )
              }
              key={ind}
              className="explore-menu-list-item"
            >
              <img
                className={category == ele.menu_name ? "active" : ""}
                src={ele.menu_image}
                alt=""
              />
              <p> {ele.menu_name} </p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;
