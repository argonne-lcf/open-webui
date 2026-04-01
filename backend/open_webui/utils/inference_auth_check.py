import aiohttp
import logging
from open_webui.config import GATEWAY_API_WHOAMI_URL, AUTHORIZED_IDP_DOMAINS, AUTHORIZED_GROUPS_PER_IDP
from open_webui.env import AIOHTTP_CLIENT_SESSION_SSL
from pydantic import BaseModel
from typing import List

# Set up logger for this module
log = logging.getLogger(__name__)

class UserPydantic(BaseModel):
    id: str
    name: str
    username: str
    user_group_uuids: List[str]
    idp_id: str
    idp_name: str
    auth_service: str

async def validate_user_access_token(user_access_token):
    """
    Check if the user is authorized to use the Inference Gateway API.
    Returns True, whoami_data, None if the user is authorized.
    Returns False, None, error_message otherwise.
    """
    
    # Prepare URL and Headers to contact the Inference Gateway API
    url = GATEWAY_API_WHOAMI_URL.value
    headers = {"Authorization": f"Bearer {user_access_token}", "Content-Type": "application/json"}

    # Make a request to the Inference Gateway API to see if user is authorized
    try:
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.get(url, headers=headers, ssl=AIOHTTP_CLIENT_SESSION_SSL) as whoami_response:
                whoami_data = await whoami_response.json()

                # If the request succeeded (meaning the user is authorized), return the whoami data
                if whoami_response.status == 200:

                    # Validate the response against UserPydantic model
                    try:
                        user = UserPydantic(**whoami_data)
                    except Exception as validation_error:
                        log.error(f"User data validation failed: {validation_error}")
                        log.error(f"Raw response data that failed validation: {whoami_data}")
                        error_message = f"User data validation failed. Please contact support."
                        return False, None, error_message

                    # Make sure the user used an authorized IDP
                    user_idp_domain = user.username.split("@")[-1]
                    if user_idp_domain not in AUTHORIZED_IDP_DOMAINS.value:
                        error_message = f"Error: Permission denied. Must authenticate with {AUTHORIZED_IDP_DOMAINS.value}. Currently authenticated as {user.username}."
                        return False, None, error_message

                    # Make sure the user is part of an authorized group (if applicable for the IDP)
                    if user_idp_domain in AUTHORIZED_GROUPS_PER_IDP.value:
                        group_overlap = set(user.user_group_uuids) & set(AUTHORIZED_GROUPS_PER_IDP.value[user_idp_domain])
                        if len(group_overlap) == 0:
                            error_message = f"Error: Permission denied. User ({user.name} - {user.username}) not part of the Globus Groups applied for {user.idp_name}."
                            return False, None, error_message

                    # If user passed all authorization checks, grant acces and return the user data
                    return True, user, None

                # If the request failed (likely due to unauthorized access) ...
                else:

                    # Try to extract just the error message from the 'detail' field
                    try:
                        if isinstance(whoami_data, dict) and 'detail' in whoami_data:
                            error_message = whoami_data['detail']
                        else:
                            error_message = str(whoami_data)
                    except Exception:
                        error_message = str(whoami_data)

                    # Return the error message
                    return False, None, error_message

    # Deny access if something went wrong during the whoami call parsing            
    except Exception as e:
        error_message = f"Call to {url} failed: {e}"
        return False, None, error_message