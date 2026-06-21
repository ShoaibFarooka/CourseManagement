import React from "react";
import "./Guide.css";

const Guide = () => {
    return (
        <>
            <div className="guide-container">
                <div className="title">Guide</div>
                <div className="sub-title">
                    Learn how to access demo content and unlock the full course experience.
                </div>
            </div>

            <div className="guide-section">
                <h2 className="guide-heading">How to Access Demo Content</h2>

                <div className="steps-container">
                    <div className="step">
                        <span>1</span>
                        Create or log in to your account.
                    </div>

                    <div className="step">
                        <span>2</span>
                        Dashboard will show available courses with demo access.
                    </div>

                    <div className="step">
                        <span>3</span>
                        Open the hamburger sign and clcik on the unit exam.
                    </div>

                    <div className="step">
                        <span>4</span>
                        Only one unit available for demo access.
                    </div>

                    <div className="step">
                        <span>5</span>
                        For further Guide a video tutorial is available below.
                    </div>

                    <div className="step">
                        <span>6</span>
                        For Further Information, please contact Admin.
                    </div>
                </div>

                <div className="video-wrapper">
                    <video controls width="100%" height="400px">
                        <source
                            src={`${import.meta.env.VITE_BASE_URL}/static/uploads/demo.mp4`}
                            type="video/mp4"
                        />
                        Your browser does not support this video format.
                    </video>
                </div>
            </div>

            <div className="guide-section">
                <h2 className="guide-heading">How to Get Full Course Access</h2>

                <div className="steps-container">
                    <div className="step">
                        <span>1</span>
                        Create or log in to your account.
                    </div>

                    <div className="step">
                        <span>2</span>
                        Select the course you want to purchase.
                    </div>

                    <div className="step">
                        <span>3</span>
                        Click on the get access button.
                    </div>

                    <div className="step">
                        <span>4</span>
                        Click on the Device Verificaion button on Dashboard.
                    </div>

                    <div className="step">
                        <span>5</span>
                        Contact Admin and complete the payment process to unlock full access.
                    </div>

                    <div className="step">
                        <span>6</span>
                        For full access Device must be verified by the admin.
                    </div>

                    <div className="step">
                        <span>7</span>
                        For furhter details watch the video available below.
                    </div>
                </div>

                <div className="video-wrapper">
                    <video controls width="100%" height="400px">
                        <source
                            src={`${import.meta.env.VITE_BASE_URL}/static/uploads/full.mp4`}
                            type="video/mp4"
                        />
                        Your browser does not support this video format.
                    </video>
                </div>
            </div>
        </>
    );
};

export default Guide;