import 'bootstrap-icons/font/bootstrap-icons.css';

function DirectionIcon({ angle }) {
    return <>{angle &&
            <i className={`bi bi-arrow-up-short`} style={{transform: `rotate(${angle}deg)`}}/>
    }</>
}

export default DirectionIcon;