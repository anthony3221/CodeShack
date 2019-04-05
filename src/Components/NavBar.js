import React, { Component } from "react";
import { auth } from "../Backend/Firebase/firebase";
import PropTypes from "prop-types";
import { Navbar, NavbarBrand, Nav, NavItem, NavLink } from "reactstrap";
import { logoutUser } from "../redux/actions/actions";
import { connect } from "react-redux";

const mapStateToProps = state => {
    return {
        isAuth: state.authUser.isAuth
    };
};

class NavBar extends Component {
    handleLogOut = event => {
        auth.signOut()
            .then(() => {
                this.props.logoutUser();
                this.context.router.history.push("/login");
            })
            .catch(err => {
                console.log("Unable to sign out user");
            });
    };

    render() {
        return (
            <div>
                <Navbar color="primary">
                    <NavbarBrand style={{ color: "white" }} href="/dashboard">
                        CodeShack
                    </NavbarBrand>
                    <Nav>
                        <NavItem>
                            <NavLink style={{ color: "white" }} href="/courses">
                                Course
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                style={{ color: "white" }}
                                href="/interview"
                            >
                                Interview
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <Nav className="ml-auto">
                        {this.props.isAuth && (
                            <NavItem>
                                <NavLink
                                    style={{ color: "white" }}
                                    href="/profile"
                                >
                                    Profile
                                </NavLink>
                            </NavItem>
                        )}
                        {this.props.isAuth && (
                            <NavItem>
                                <NavLink
                                    style={{ color: "white" }}
                                    href="/login"
                                    onClick={this.handleLogOut}
                                >
                                    Log Out
                                </NavLink>
                            </NavItem>
                        )}
                    </Nav>
                </Navbar>
            </div>
        );
    }
}

NavBar.contextTypes = {
    router: PropTypes.object.isRequired
};

export default connect(
    mapStateToProps,
    { logoutUser }
)(NavBar);
