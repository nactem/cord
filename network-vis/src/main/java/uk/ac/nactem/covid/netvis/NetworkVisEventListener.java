package uk.ac.nactem.covid.netvis;

import org.apache.wicket.ajax.AjaxRequestTarget;

/**
 *
 * @author sam
 */
public interface NetworkVisEventListener {

    public void onNodeClick(AjaxRequestTarget target, int id);
    
}
