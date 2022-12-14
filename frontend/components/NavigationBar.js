import { Nav, Navbar, Container, Button, ToggleButton } from "react-bootstrap";
import {useState, useEffect, useContext} from 'react';
import { Web3Button } from '@web3modal/react';
import {
  CONTRACT_DETAILS
} from "../constants";

const NavigationBar = ({ network }) => {

  return (
    <Navbar expand="lg" bg="primary" variant="dark">
      <Container>
        <Navbar.Brand href="#home">AnyChainDAO</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text>
            On Network: {network.name} ({CONTRACT_DETAILS[network.id]["contractType"]} voting chain)
          </Navbar.Text>
        </Navbar.Collapse>
        <Navbar.Collapse className="justify-content-end">
          <Web3Button />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
export default NavigationBar;