function MultiSelection({ title, selections, selected, handleSelection }) {
    return (
        <div className='row g-0 mb-2' style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className='col-2' style={{ display: 'flex', alignItems: 'center' }}>
                <strong>{title}</strong>
            </div>
            <div className='col-10'>
            {selections.map(selection => {
                return (
                    <button
                        className={`list-group-item list-group-item-action ${selection === selected ? 'active disabled' : ''}`}
                        style={{textAlign: 'left'}}
                        onClick={() => handleSelection(selection)}>
                        <div>
                            <small>
                                {selection}
                            </small>
                        </div>
                    </button>
                )
            })}
            </div>
        </div>
    )
}

export default MultiSelection;