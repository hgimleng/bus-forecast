import 'bootstrap-icons/font/bootstrap-icons.css';

function BDIcon({ icon }) {
    return (
        <div style={{ display: "flex", whiteSpace: "nowrap" }}>
            <i className={`bi ${icon}`}></i>
            <div style={{ transform: 'scaleX(-1)' }}>
                <i className={`bi ${icon}`}></i>
            </div>
        </div>
    )
}

export default BDIcon;