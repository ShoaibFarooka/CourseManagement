import './Banner.css';

const getImageUrl = (imageName) => {
    return new URL(`../../../../../assets/images/${imageName}`, import.meta.url).href;
};

const Banner = ({ titleLines = [], subtitle, buttonText, onButtonClick, image }) => {
    return (
        <div
            className="banner"
            style={{
                backgroundImage: image
                    ? `url(${getImageUrl(image)}), linear-gradient(180deg, #299FA7 0%, #15787F 100%)`
                    : `linear-gradient(90deg, #218D95 0%, #C8C8C8 54.33%, #218C95 100%);`,
            }}
        >
            <div className="container">
                <div className="content">
                    {titleLines.map((line, index) => (
                        <p key={index}>
                            {line.highlight && <span className="highlight">{line.highlight}</span>}{" "}
                            {line.text}
                        </p>
                    ))}

                    <div className="subtitle">
                        <p>{subtitle}</p>
                        {buttonText && (
                            <button className="button" onClick={onButtonClick}>
                                {buttonText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Banner;
