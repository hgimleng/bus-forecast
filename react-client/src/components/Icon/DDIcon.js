import 'bootstrap-icons/font/bootstrap-icons.css';

function DDIcon({ icon }) {
    return (
        <>
            <i className={`bi ${icon}`} style={{ display: 'block', marginBottom: '-0.8em', transform: 'scaleY(0.7)'}} ></i>
            <i className={`bi ${icon}`} style={{ display: 'block', marginTop: '-0.8em', transform: 'scaleY(0.7)' }}></i>
        </>
    )
}

export default DDIcon;