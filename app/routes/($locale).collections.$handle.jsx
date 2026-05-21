import {redirect, useLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';

export async function loader(args) {
  return args;
}


export default function Collection() {
  const data = useLoaderData();

  return <pa-collection-page data-collection-handle={data.params.handle}/>
}
