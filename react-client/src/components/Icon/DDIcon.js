import 'bootstrap-icons/font/bootstrap-icons.css';

function DDIcon({ load }) {
    const baseIcon = "bi-code-square"
    let loadIcon = null;

    if (load === 2) {
        loadIcon = "bi bi-square-half";
    } else if (load === 3) {
        loadIcon = "bi bi-square-fill";
    }

    return (
        <div style={{position: 'relative', display: 'flex'}}>
            <i className={`bi ${baseIcon}`} style={{transform: 'rotate(90deg)'}}></i>
            {loadIcon &&
                <i className={`bi ${loadIcon}`} style={{position: 'absolute', opacity: 0.3}}></i>}
        </div>
    )
}

export default DDIcon;