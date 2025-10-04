import './Banner.css';

const getImageUrl = (imageName) => {
    return new URL(`../../../../../assets/images/${imageName}`, import.meta.url).href;
};

const Banner = ({ titleLines = [], subtitle, buttonText, onButtonClick, image }) => {
    return (
        <div
            className="banner"
        >
            <div className="container">

                <div className="content">
                    {titleLines.map((line, index) => (
                        <p key={index}>
                            {line.beforeText && line.beforeText}
                            {line.highlight && <span className="highlight">{line.highlight}</span>}{" "}
                            {line.afterText && line.afterText}
                            {line.text && line.text}
                        </p>
                    ))}

                    <div className="subtitle">
                        <p>{subtitle}</p>
                        {buttonText && (
                            <button className=" demo-btn" onClick={onButtonClick}>
                                {buttonText}
                            </button>
                        )}
                    </div>
                </div>

                {image && (
                    <div className="image">
                        <img src={getImageUrl(image)} alt="Banner" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Banner;
