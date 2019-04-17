import React, { Component } from "react";
import { connect } from "react-redux";
import { loadTopic } from "../redux/actions/actions";
import { Jumbotron, Container } from "reactstrap";
import { BarLoader } from "react-spinners";
import { PropTypes } from "prop-types";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { convertFromRaw } from "draft-js";

const mapStateToProps = state => {
    return {
        currentTopic: state.topic.currentTopic,
        isLoading: state.loading.isLoading
    };
};

/**
 * Component which lists all questions for a course
 */
export class TopicQuestions extends Component {
    componentDidMount() {
        this.props.loadTopic(this.props.match.params.id);
    }

    /**
     * Formats the description of a question to be readable
     */
    formatDescription = (cell, row) => {
        console.log(cell);
        return convertFromRaw(JSON.parse(cell)).getPlainText();
    };

    /**
     * Handles clicking on a question
     */
    onRowClick = row => {
        this.context.router.history.push(`/topic/${row._id}`);
    };

    render() {
        // While quesitons are being fetched, loading
        if (this.props.isLoading) {
            return (
                <main>
                    <BarLoader
                        width={100}
                        widthUnit={"%"}
                        color={"#c5050c"}
                        loading={this.props.isLoading}
                    />
                </main>
            );
        }
        const options = {
            onRowClick: this.onRowClick
        };
        return (
            <div>
                <main>
                    <Jumbotron>
                        <Container>
                            <h3 className="display-3">
                                {this.props.currentTopic.topicName}
                            </h3>
                        </Container>
                    </Jumbotron>
                    <Container>
                        <h2 style={{ marginTop: "16px", marginBottom: "16px" }}>
                            Questions
                        </h2>
                        <BootstrapTable
                            data={this.props.currentTopic.questions}
                            striped
                            pagination={true}
                            search={true}
                            hover
                            bordered={false}
                            options={options}
                        >
                            <TableHeaderColumn
                                width="30%"
                                isKey={true}
                                dataField="name"
                            >
                                Name
                            </TableHeaderColumn>
                            <TableHeaderColumn
                                tdStyle={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden"
                                }}
                                thStyle={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden"
                                }}
                                dataField="content"
                                width="65%"
                                dataFormat={this.formatDescription}
                            >
                                Description
                            </TableHeaderColumn>
                        </BootstrapTable>
                    </Container>
                </main>
                <footer>
                    <Container>
                        <hr />
                        <p>&copy; CodeShack 2019</p>
                    </Container>
                </footer>
            </div>
        );
    }
}

TopicQuestions.contextTypes = {
    router: PropTypes.object.isRequired
};

export default connect(
    mapStateToProps,
    { loadTopic }
)(TopicQuestions);
