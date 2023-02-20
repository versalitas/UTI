import React from 'react';
import './users.css';

class Users extends React.Component {
    constructor(props) {
        super(props);
    }

    activate = (index, value) => {
        console.log(index, value);
        this.props.socket.emit('roleAdmin', { activated: value, index: index });
    };

    render() {
        const type = this.props.type;

        let users = this.props.users.map((u, index) => (
            <li className="user" key={u.id}>
                <span
                    className={u.activated ? 'userActive' : 'userDisactivated'}
                >
                    {u.nickname}
                </span>{' '}
                {u.activated ? (
                    <button
                        className={'buttonActiveRole_' + type}
                        onClick={() => {
                            this.activate(index, !u.activated);
                        }}
                    >
                        -
                    </button>
                ) : (
                    <button
                        className={'buttonActiveRole_' + type}
                        onClick={() => {
                            this.activate(index, !u.activated);
                        }}
                    >
                        |
                    </button>
                )}{' '}
            </li>
        ));

        return <div id="users">{users || 'None'}</div>;
    }
}

export default Users;
