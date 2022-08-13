// taxondb.js

import { get } from 'svelte/store'; 
import { db } from './db';

class TaxonManager {

  static getCategory(id) {
    if ( id === null ) {
      return { title: 'Animal Finder', id: null };
    }
    let $db = get(db);
    let stmt = $db.prepare(`SELECT * FROM nodes_taxoncategory WHERE id = :id`);
    let row = stmt.getAsObject({ ':id': id });
    if (row.content) {
      let content = JSON.parse(row.content)
      row.previewImage = content.previewImage;
    } else {
      row.previewImage = null;
    }
    return {
      id: row.id,
      parentId: row.parent_id,
      scientificName: row.scientific_name,
      vernacularName: row.vernacular_name,
      title: row.vernacular_name ? row.vernacular_name : row.scientific_name,
      slug: row.slug
    };

  }

  static taxonCategorySet(category) {

    let parentId = ( category === undefined ) ? null : category.id;

    let $db = get(db);

    let rows = [];
    console.log("-- taxonCategory", db, parentId);
    let stmt;

    let seen = {};

    if ( parentId === null ) {
      stmt = $db.prepare(`SELECT * FROM nodes_taxoncategory WHERE parent_id IS NULL ORDER BY vernacular_name, scientific_name`);
    } else {
      stmt = $db.prepare(`SELECT * FROM nodes_taxoncategory WHERE parent_id = :id ORDER BY vernacular_name, scientific_name`);
      stmt.bind({ ':id': parentId })
    }
    // console.log("-- taxonCategories", stmt.getSQL(), parentId);
    while(stmt.step()) {
      let row = stmt.getAsObject();
      if ( seen[row.id] ) { continue; }
      seen[row.id] = true;
      // console.log("-->", row.scientific_name);
      let subCategory = {
        id: row.id,
        parentId: row.parent_id,
        vernacularName: row.vernacular_name,
        scientificName: row.scientific_name,
        slug: row.slug,
        previewImage: null
      };
      if (row.content) {
        let content = JSON.parse(row.content)
        subCategory.previewImage = content.previewImage;
      }
      rows.push(subCategory);
    }
    return rows.length > 0 ? rows : null;
  }

  static getTaxonInformationBySlug(slug) {

    let sql = `SELECT * FROM nodes_taxoninformation WHERE slug = :slug`;
    let $db = get(db);
    let stmt = $db.prepare(sql);
    let row = stmt.getAsObject({ ':slug': slug });
    if ( row.id == undefined ) {
      return null;
    }
    let content;
    try {
      content = JSON.parse(row.content);
    } catch(error) {
      console.log("-- getTaxonInformation", slug, row, error);
      return {};
    }
    let info = content.taxonInformation;
    info.categoryId = row.category_id;
    info.id = row.id;
    info.slug = row.slug;
    
    return info;
  }

  static getTaxonInformationById(id) {

    let sql = `SELECT * FROM nodes_taxoninformation WHERE id = :id`;
    let $db = get(db);
    let stmt = $db.prepare(sql);
    let row = stmt.getAsObject({ ':id': id });
    console.log("-- getTaxonInformation", id, row);

    if (row.id == undefined) {
      return null;
    }
    let content;
    try {
      content = JSON.parse(row.content);
    } catch (error) {
      console.log("-- getTaxonInformation", slug, row, error);
      return {};
    }
    let info = content.taxonInformation;
    info.title = info.vernacularName ? info.vernacularName : info.scientificName;
    info.categoryId = row.category_id;
    info.id = row.id;
    info.slug = row.slug;

    return info;
  }

  static taxonInformationSet(category) {

    let categoryId = (category === undefined) ? null : category.id;

    let $db = get(db);

    let rows = [];
    console.log("-- taxonInformation", db, categoryId);
    let stmt;

    // also grab the category taxonInformation if present
    if ( category !== undefined && category.slug ) {
      let info = TaxonManager.getTaxonInformationBySlug(category.slug.replace('classification/', 'accounts/'));
      if (info) {
        rows.push(info);
      }
    }

    if (categoryId === null || category.id === undefined ) {
      return null;
      // stmt = $db.prepare(`SELECT * FROM nodes_taxoninformation WHERE parent_id IS NULL ORDER BY vernacular_name, scientific_name`);
    } else {
      stmt = $db.prepare(`SELECT * FROM nodes_taxoninformation WHERE category_id = :categoryId AND is_category = 0 ORDER BY vernacular_name, scientific_name`);
      stmt.bind({ ':categoryId': categoryId })
    }

    // console.log("-- taxonCategories", stmt.getSQL(), categoryId);
    let seen = {};
    while (stmt.step()) {
      let row = stmt.getAsObject();
      if (seen[row.id]) { continue; }
      seen[row.id] = true;
      if (row.content) {
        let content = JSON.parse(row.content);
        let info = content.taxonInformation;
        info.categoryId = row.category_id;
        info.id = row.id;
        info.slug = row.slug;
        rows.push(info);
      } else {
      
      }
    }
    return rows.length > 0 ? rows : null;
  }

  static search(searchTerm) {
    let $db = get(db);
    let sql = `
  SELECT id, 'taxonCategory' AS typeOf, scientific_name, vernacular_name 
  FROM nodes_taxoncategory
  WHERE scientific_name LIKE :q1 OR vernacular_name LIKE :q1
  UNION
  SELECT id, 'taxonCategory' AS typeOf, scientific_name, vernacular_name 
  FROM nodes_taxoncategory
  WHERE scientific_name LIKE :q2 OR vernacular_name LIKE :q2
  UNION
  SELECT id, 'taxonInformation' AS typeOf, scientific_name, vernacular_name 
  FROM nodes_taxoninformation
  WHERE ( scientific_name LIKE :q1 OR vernacular_name LIKE :q1 ) AND is_category = 0
  UNION
  SELECT id, 'taxonInformation' AS typeOf, scientific_name, vernacular_name 
  FROM nodes_taxoninformation
  WHERE ( scientific_name LIKE :q2 OR vernacular_name LIKE :q2 ) AND is_category = 0
`;

    let stmt = $db.prepare(sql);
    stmt.bind({ ':q1': `% ${searchTerm}%`, ':q2': '${searchTerm}%' });

    let rows = [];
    let seen = {};
    while (stmt.step()) {
      let row = stmt.getAsObject();
      if (seen[row.id]) { continue; }
      seen[row.id] = true;
      let result = {
        id: row.id,
        scientificName: row.scientific_name,
        vernacularName: row.vernacular_name,
        title: row.vernacular_name ? row.vernacular_name : row.scientific_name,
        categoryId: row.parent_id ? row.parent_id : row.category_id,
        typeOf: row.typeOf,
        previewImage: null
      }
      if ( result.typeOf == 'taxonCategory' && row.content ) {
        let content = JSON.parse(row.content)
        result.previewImage = content.previewImage;
      } else if ( result.typeOf == 'taxonInformation' ) {
        let content = JSON.parse(row.content);
        result.previewImage = content.taxonInformation.previewImage;
      }
      console.log("--:", row.id, row.scientific_name, row.vernacular_name, row.typeOf);
    }
  }

  static db() {
    return get(db);
  }

}

window.TaxonManager = TaxonManager;
export default TaxonManager;